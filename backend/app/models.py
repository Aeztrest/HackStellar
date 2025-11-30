# models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.sql import func

from .database import Base

class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    cid = Column(String(100), unique=True, nullable=False)      # encrypted CID
    ipfs_uri = Column(String(200), nullable=False)              # ipfs://...
    gateway_url = Column(String(300), nullable=False)           # https gateway

    price = Column(Numeric(10, 2), nullable=True)
    is_subscription_only = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ===========================================================
# 🔐 ŞİFRELEME ANAHTARLARINI TUTACAĞIMIZ TABLO
# ===========================================================

class EncryptedContentKey(Base):
    __tablename__ = "encrypted_content_keys"

    id = Column(Integer, primary_key=True, index=True)

    # Bu, Soroban kontratındaki content ID ile bire bir eşleşecek
    content_id = Column(Integer, index=True, nullable=False)

    # AES anahtarını base64 formatında tutacağız
    aes_key = Column(String(255), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
