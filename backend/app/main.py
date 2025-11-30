import os
import subprocess
import time  # 👈 retry için

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError  # 👈 DB hazır değilse yakalamak için

from .database import engine, Base, get_db, ping_db
from . import models  # Content & EncryptedContentKey modelleri

load_dotenv()

CREATOR_HUB_CONTRACT_ID = os.getenv("CREATOR_HUB_CONTRACT_ID")
STELLAR_NETWORK = os.getenv("STELLAR_NETWORK", "testnet")
STELLAR_ADMIN_ALIAS = os.getenv("STELLAR_ADMIN_ALIAS", "creator-admin")

# WEB3_STORAGE_TOKEN yerine PINATA_JWT kullanıyoruz
PINATA_JWT = os.getenv("PINATA_JWT")

# IPFS_GATEWAY env'den gelsin, yoksa default Pinata gateway'i olsun
_raw_gateway = os.getenv("IPFS_GATEWAY", "https://bronze-negative-tiglon-986.mypinata.cloud")
if not _raw_gateway.startswith("http"):
    IPFS_GATEWAY = "https://" + _raw_gateway.strip("/")
else:
    IPFS_GATEWAY = _raw_gateway.rstrip("/")

app = FastAPI(
    title="Stellar CreatorHub Backend",
    version="0.6.0",
)


# ======================
# STARTUP: DB TABLOLARINI OLUŞTUR
# ======================

@app.on_event("startup")
def on_startup():
    """
    Uygulama ayağa kalkarken MySQL hazır olmayabilir.
    Bu yüzden tablo oluşturmayı birkaç kez deniyoruz.
    """
    max_retries = 10

    for attempt in range(1, max_retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            print("✅ DB tabloları oluşturuldu / zaten vardı.")
            break
        except OperationalError as e:
            print(f"⚠️ DB hazır değil, tekrar denenecek ({attempt}/{max_retries}): {e}")
            time.sleep(3)
    else:
        print("❌ DB'ye bağlanılamadı, create_all başarısız.")


# ======================
# BASIC HEALTH ENDPOINT'LER
# ======================

@app.get("/")
def read_root():
    return {"message": "Stellar CreatorHub backend ayakta!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/db-health")
def db_health_check():
    ok = ping_db()
    return {"db_ok": ok}


@app.get("/example")
def example_endpoint(db: Session = Depends(get_db)):
    """
    İleride MySQL'deki tablolardan veri çekmek için kullanacağın pattern.
    Şu an sadece bağlantı kurup geri dönüyor.
    """
    return {"message": "DB bağlantısı kuruldu, buradan devam edebilirsin."}


# ======================
# REQUEST MODELLERİ
# ======================

class CreatorRegisterRequest(BaseModel):
    creator_address: str
    profile_uri: str
    subscription_price: int  # stroop (1 XLM = 10_000_000)


class MintContentRequest(BaseModel):
    creator_address: str
    ipfs_cid: str               # 🔐 şifrelenmiş dosyanın CID'i
    price: int
    is_for_subscribers: bool = True
    aes_key: str                # 🔑 içerik için kullanılan AES anahtarı (base64)


class SubscribeRequest(BaseModel):
    subscriber_address: str
    creator_address: str
    months: int = 1


class BuyContentRequest(BaseModel):
    buyer_address: str
    content_id: int


class AccessCheckRequest(BaseModel):
    user_address: str
    content_id: int


class ContentKeyRequest(BaseModel):
    """
    Kullanıcı bir içeriğin KEY'ini almak istediğinde kullanacağımız model.
    Şimdilik imzayı doğrulama kısmını TODO bırakıyoruz; mimari hazır olsun.
    """
    wallet_address: str
    content_id: int
    # TODO: ileride wallet imzası da eklenebilir:
    # signature: str
    # message: str


# ======================
# STELLAR CLI HELPER
# ======================

def run_stellar_contract_invoke(method: str, args: list[str], source_account: str | None = None) -> str:
    """
    CLI üzerinden kontrat çağırmak için helper.

    - write (state değiştiren) fonksiyonlar için:
      source_account = ilgili user address (creator/subscriber/buyer)
      Böylece kontrattaki `require_auth()` çağrıları geçer.

    - read-only fonksiyonlar için (has_access vb.):
      source_account None bırakılabilir → STELLAR_ADMIN_ALIAS kullanılır.
    """
    if not CREATOR_HUB_CONTRACT_ID:
        raise RuntimeError("CREATOR_HUB_CONTRACT_ID is not set")

    signer = source_account or STELLAR_ADMIN_ALIAS
    if not signer:
        raise RuntimeError("No source account configured for Stellar CLI call")

    cmd = [
        "stellar",
        "contract",
        "invoke",
        "--network",
        STELLAR_NETWORK,
        "--source-account",
        signer,
        "--id",
        CREATOR_HUB_CONTRACT_ID,
        "--",
        method,
    ] + args

    print("🔹 Running stellar CLI:", " ".join(cmd))

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"Stellar CLI error: {result.stderr or result.stdout}"
        )

    return (result.stdout or "").strip()


# ======================
# IPFS UPLOAD (PINATA)
# ======================

@app.post("/ipfs/upload")
async def upload_to_ipfs(file: UploadFile = File(...)):
    """
    Pinata üzerinden dosyayı IPFS'e yükler.
    Dönüş: cid, ipfs_uri, gateway_url

    ÖNEMLİ: Frontend bu endpoint'e her zaman
    ZATEN ŞİFRELENMİŞ dosyayı yollamalı.
    """
    if not PINATA_JWT:
        raise HTTPException(status_code=500, detail="PINATA_JWT not configured")

    try:
        data = await file.read()

        headers = {
            "Authorization": f"Bearer {PINATA_JWT}",
        }
        files = {
            "file": (file.filename, data),
        }

        resp = requests.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            headers=headers,
            files=files,
            timeout=60,
        )

        if resp.status_code not in (200, 201):
            raise HTTPException(
                status_code=500,
                detail=f"IPFS upload failed: {resp.text}",
            )

        json_resp = resp.json()
        cid = json_resp["IpfsHash"]

        return {
            "cid": cid,
            "ipfs_uri": f"ipfs://{cid}",
            "gateway_url": f"{IPFS_GATEWAY}/ipfs/{cid}",
        }
    finally:
        await file.close()


# ======================
# CREATOR REGISTER
# ======================

@app.post("/creator/register")
def register_creator(req: CreatorRegisterRequest):
    """
    Kontrattaki register_creator fonksiyonunu çağırır.

    Kontrat imzası:
    pub fn register_creator(env: Env, creator: Address, profile_uri: String, price: i128)
    """
    try:
        output = run_stellar_contract_invoke(
            "register_creator",
            [
                "--creator",
                req.creator_address,
                "--profile_uri",
                req.profile_uri,
                "--price",
                str(req.subscription_price),
            ],
            source_account=req.creator_address,  # 🔐 require_auth(creator) için
        )
        return {"ok": True, "cli_output": output}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ======================
# CONTENT MINT (ŞİFRELİ İÇERİK)
# ======================

@app.post("/content/mint")
def mint_content(req: MintContentRequest, db: Session = Depends(get_db)):
    """
    Şifrelenmiş IPFS CID'ini alır, kontratta mint_content çağırır
    ve bu içerik için AES anahtarını DB'de saklar.

    Beklenen flow:
    1) Frontend dosyayı client-side AES ile şifreler.
    2) Şifreli dosyayı /ipfs/upload ile IPFS'e atar → cid alır.
    3) Bu endpoint'e:
        - creator_address
        - ipfs_cid (encrypted cid)
        - price
        - is_for_subscribers
        - aes_key (base64)
       ile gelir.

    Kontrattaki imza:
    pub fn mint_content(
        env: Env,
        creator: Address,
        encrypted_cid: String,
        price: i128,
        is_for_subscribers: bool
    ) -> u64
    """
    try:
        # 1) Soroban kontratına içerik kaydını yaz
        output = run_stellar_contract_invoke(
            "mint_content",
            [
                "--creator",
                req.creator_address,
                "--encrypted_cid",
                f"ipfs://{req.ipfs_cid}",
                "--price",
                str(req.price),
                "--is_for_subscribers",
                "true" if req.is_for_subscribers else "false",
            ],
            source_account=req.creator_address,  # 🔐 require_auth(creator) için
        )

        content_id_str = output.strip()

        try:
            content_id = int(content_id_str)
        except ValueError:
            # CLI çıktısı beklediğimiz gibi değilse
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected contract output for content_id: {content_id_str}",
            )

        # 2) AES key'i DB'ye kaydet
        key_row = models.EncryptedContentKey(
            content_id=content_id,
            aes_key=req.aes_key,
        )
        db.add(key_row)
        db.commit()
        db.refresh(key_row)

        return {
            "ok": True,
            "content_id": content_id,
            "cli_output": output,
        }
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ======================
# SUBSCRIBE
# ======================

@app.post("/subscription/subscribe")
def subscribe(req: SubscribeRequest):
    """
    Kontrattaki subscribe fonksiyonunu çağırır.
    Şimdilik sadece on-chain state; ödeme logic'i sonra eklenecek.

    Kontrat imzası:
    pub fn subscribe(env: Env, subscriber: Address, creator: Address, months: u32)
    """
    try:
        output = run_stellar_contract_invoke(
            "subscribe",
            [
                "--subscriber",
                req.subscriber_address,
                "--creator",
                req.creator_address,
                "--months",
                str(req.months),
            ],
            source_account=req.subscriber_address,  # 🔐 require_auth(subscriber) için
        )
        return {"ok": True, "cli_output": output}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ======================
# BUY CONTENT
# ======================

@app.post("/content/buy")
def buy_content(req: BuyContentRequest):
    """
    Kontrattaki buy_content fonksiyonunu çağırır.

    Kontrat imzası:
    pub fn buy_content(env: Env, buyer: Address, content_id: u64)
    """
    try:
        output = run_stellar_contract_invoke(
            "buy_content",
            [
                "--buyer",
                req.buyer_address,
                "--content_id",
                str(req.content_id),
            ],
            source_account=req.buyer_address,  # 🔐 require_auth(buyer) için
        )
        return {"ok": True, "cli_output": output}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ======================
# ACCESS CHECK (DEBUG / FRONTEND YARDIMCI)
# ======================

@app.post("/access/check")
def access_check(req: AccessCheckRequest):
    """
    Kontrattaki has_access fonksiyonunu çağırır.
    Sadece simulation/read-only; state değiştirmez.

    Kontrat imzası:
    pub fn has_access(env: Env, user: Address, content_id: u64) -> bool
    """
    try:
        # has_access require_auth istemiyor, admin ile okunabilir
        output = run_stellar_contract_invoke(
            "has_access",
            [
                "--user",
                req.user_address,
                "--content_id",
                str(req.content_id),
            ],
        )
        has_access = output.strip().lower() == "true"
        return {"ok": True, "has_access": has_access, "cli_output": output}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ======================
# KEY DAĞITIM ENDPOINT'İ
# ======================

@app.post("/content/key")
def get_content_key(req: ContentKeyRequest, db: Session = Depends(get_db)):
    """
    Kullanıcıya içerik AES key'ini veren endpoint.

    Adımlar:
    1) (TODO) wallet imzası doğrulanabilir.
    2) Soroban kontratında has_access(user, content_id) çağrılır.
    3) Eğer true ise DB'den ilgili content_id için AES key alınır ve döner.
    """
    # 1) On-chain erişim kontrolü (read-only, admin ile imzalanabilir)
    try:
        output = run_stellar_contract_invoke(
            "has_access",
            [
                "--user",
                req.wallet_address,
                "--content_id",
                str(req.content_id),
            ],
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    has_access = output.strip().lower() == "true"
    if not has_access:
        raise HTTPException(status_code=403, detail="User has no access to this content")

    # 2) DB'den AES key'i çek
    key_row = (
        db.query(models.EncryptedContentKey)
        .filter(models.EncryptedContentKey.content_id == req.content_id)
        .first()
    )

    if not key_row:
        raise HTTPException(status_code=404, detail="AES key not found for this content")

    # 3) Frontend'e key'i döndür
    return {
        "ok": True,
        "content_id": req.content_id,
        "aes_key": key_row.aes_key,
    }
