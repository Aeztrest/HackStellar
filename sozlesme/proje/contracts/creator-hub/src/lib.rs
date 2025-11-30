#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, String, Map};

// Storage key sabitleri (her yerde tekrar tekrar Symbol::new yazmamak için)
const KEY_CREATORS: &str = "creators";
const KEY_CONTENTS: &str = "contents";
const KEY_SUBS: &str = "subs";
const KEY_PURCHASES: &str = "purchases";

#[contract]
pub struct CreatorHub;

// ----------------------
// DATA TYPES
// ----------------------

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Creator {
    /// Creator'ın profil bilgilerini veya metadata URI'sini tutar (ör: IPFS JSON, web URL)
    pub profile_uri: String,
    /// Aylık abonelik fiyatı (off-chain payment logic bu price'a göre çalışabilir)
    pub subscription_price: i128,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Content {
    /// İçeriğin sahibi creator address
    pub creator: Address,
    /// Şifrelenmiş dosyanın IPFS CID'i
    /// (encrypted CID – raw dosya hiçbir zaman zincire gelmiyor)
    pub encrypted_cid: String,
    /// İçeriğin tekil satın alma fiyatı (abonelik dışında pay-per-content)
    pub price: i128,
    /// true ise: bu içerik sadece abonelere özel
    pub is_for_subscribers: bool,
}

// ----------------------
// CONTRACT IMPL
// ----------------------

#[contractimpl]
impl CreatorHub {
    // =========================
    // CREATOR REGISTRY
    // =========================

    /// Yeni bir creator kaydı açar.
    /// `creator` kendi adresi olmalı ve imza ile yetkilendirilmelidir.
    pub fn register_creator(env: Env, creator: Address, profile_uri: String, price: i128) {
        // Güvenlik: bu çağrıyı yapan gerçekten creator mı?
        creator.require_auth();

        let mut creators: Map<Address, Creator> = Self::read_creators(&env);
        creators.set(
            creator.clone(),
            Creator {
                profile_uri,
                subscription_price: price,
            },
        );
        env.storage()
            .persistent()
            .set(&Symbol::new(&env, KEY_CREATORS), &creators);
    }

    /// Creator profilini günceller.
    pub fn update_creator(env: Env, creator: Address, new_uri: String, new_price: i128) {
        creator.require_auth();

        let mut creators: Map<Address, Creator> = Self::read_creators(&env);

        if let Some(mut c) = creators.get(creator.clone()) {
            c.profile_uri = new_uri;
            c.subscription_price = new_price;
            creators.set(creator.clone(), c);
            env.storage()
                .persistent()
                .set(&Symbol::new(&env, KEY_CREATORS), &creators);
        }
    }

    /// Creator bilgilerini döner.
    pub fn get_creator(env: Env, creator: Address) -> Option<Creator> {
        let creators: Map<Address, Creator> = Self::read_creators(&env);
        creators.get(creator)
    }

    // =========================
    // CONTENT MINTING
    // =========================

    /// Creator yeni bir içerik oluşturur.
    /// `encrypted_cid` client-side şifrelenmiş dosyanın IPFS CID'idir.
    pub fn mint_content(
        env: Env,
        creator: Address,
        encrypted_cid: String,
        price: i128,
        is_for_subscribers: bool,
    ) -> u64 {
        // Güvenlik: sadece ilgili creator kendi adına içerik mint edebilsin
        creator.require_auth();

        let mut contents: Map<u64, Content> = Self::read_contents(&env);
        let next_id = contents.len() as u64 + 1;

        contents.set(
            next_id,
            Content {
                creator,
                encrypted_cid,
                price,
                is_for_subscribers,
            },
        );

        env.storage()
            .persistent()
            .set(&Symbol::new(&env, KEY_CONTENTS), &contents);
        next_id
    }

    /// Belirli bir içeriğin detaylarını döner.
    /// Backend/Frontend buradan `encrypted_cid` ve diğer metaları okuyabilir.
    pub fn get_content(env: Env, content_id: u64) -> Option<Content> {
        let contents: Map<u64, Content> = Self::read_contents(&env);
        contents.get(content_id)
    }

    // =========================
    // SUBSCRIPTIONS
    // =========================

    /// `months`: kaç aylık abonelik.
    /// Burada sadece on-chain abonelik süresini kaydediyoruz.
    /// Gerçek ödeme akışı ayrı bir payment kontratı veya off-chain sistemde doğrulanabilir.
    pub fn subscribe(env: Env, subscriber: Address, creator: Address, months: u32) {
        // Basit MVP: abonelik başlatmak isteyen kullanıcı imza atmalı
        subscriber.require_auth();

        let mut subs: Map<(Address, Address), u64> = Self::read_subscriptions(&env);

        let now: u64 = env.ledger().timestamp();
        let duration: u64 = (months as u64) * 30 * 24 * 3600;
        let expiry: u64 = now + duration;

        subs.set((subscriber.clone(), creator.clone()), expiry);
        env.storage()
            .persistent()
            .set(&Symbol::new(&env, KEY_SUBS), &subs);
    }

    /// Kullanıcının bir creator'a aktif aboneliği var mı?
    pub fn is_subscribed(env: Env, user: Address, creator: Address) -> bool {
        let subs: Map<(Address, Address), u64> = Self::read_subscriptions(&env);
        if let Some(exp) = subs.get((user, creator)) {
            let now: u64 = env.ledger().timestamp();
            return exp > now;
        }
        false
    }

    // =========================
    // PAY-PER-CONTENT
    // =========================

    /// Kullanıcı tekil bir içerik satın aldığında çağrılır.
    /// (Ödeme yine ayrı bir kontrat veya off-chain kontrol tarafından yapılabilir.)
    pub fn buy_content(env: Env, buyer: Address, content_id: u64) {
        buyer.require_auth();

        let mut purchases: Map<(Address, u64), bool> = Self::read_purchases(&env);
        purchases.set((buyer, content_id), true);

        env.storage()
            .persistent()
            .set(&Symbol::new(&env, KEY_PURCHASES), &purchases);
    }

    // =========================
    // ACCESS CONTROL
    // =========================

    /// Backend'in KEY dağıtımı yaparken kullanacağı asıl fonksiyon.
    /// true → bu user ilgili içeriğe erişebilir, KEY ver.
    /// false → erişemez, KEY verme.
    pub fn has_access(env: Env, user: Address, content_id: u64) -> bool {
        let contents: Map<u64, Content> = Self::read_contents(&env);

        let content = match contents.get(content_id) {
            Some(c) => c,
            None => return false,
        };

        // 1) Tekil satın alma kontrolü
        let purchases: Map<(Address, u64), bool> = Self::read_purchases(&env);
        if let Some(true) = purchases.get((user.clone(), content_id)) {
            return true;
        }

        // 2) Abonelik kontrolü (abonelik gerektiriyorsa)
        if content.is_for_subscribers {
            let subs: Map<(Address, Address), u64> = Self::read_subscriptions(&env);
            if let Some(exp) = subs.get((user.clone(), content.creator.clone())) {
                let now: u64 = env.ledger().timestamp();
                if exp > now {
                    return true;
                }
            }
        }

        false
    }

    /// Convenience helper:
    /// Backend, önce has_access ile uğraşmak istemezse direkt bu fonksiyonu çağırabilir.
    /// Erişimi varsa encrypted CID dönülür, yoksa None.
    ///
    /// Örn: Backend flow
    ///  - has_access = get_encrypted_cid_for_user(env, user, content_id)
    ///  - Some(cid) → KEY ver + bu CID ile IPFS'ten dosyayı çektir
    ///  - None → 403
    pub fn get_encrypted_cid_for_user(
        env: Env,
        user: Address,
        content_id: u64,
    ) -> Option<String> {
        if !Self::has_access(env.clone(), user.clone(), content_id) {
            return None;
        }

        let contents: Map<u64, Content> = Self::read_contents(&env);
        contents.get(content_id).map(|c| c.encrypted_cid)
    }

    // =========================
    // READ HELPERS
    // =========================

    fn read_creators(env: &Env) -> Map<Address, Creator> {
        env.storage()
            .persistent()
            .get(&Symbol::new(env, KEY_CREATORS))
            .unwrap_or(Map::new(env))
    }

    fn read_contents(env: &Env) -> Map<u64, Content> {
        env.storage()
            .persistent()
            .get(&Symbol::new(env, KEY_CONTENTS))
            .unwrap_or(Map::new(env))
    }

    fn read_subscriptions(env: &Env) -> Map<(Address, Address), u64> {
        env.storage()
            .persistent()
            .get(&Symbol::new(env, KEY_SUBS))
            .unwrap_or(Map::new(env))
    }

    fn read_purchases(env: &Env) -> Map<(Address, u64), bool> {
        env.storage()
            .persistent()
            .get(&Symbol::new(env, KEY_PURCHASES))
            .unwrap_or(Map::new(env))
    }
}
