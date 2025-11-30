#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::EnvExt, Env, Address, String};

#[test]
fn test_register_creator() {
    let env = Env::default();
    let contract_id = env.register_contract(None, CreatorHub);
    let client = CreatorHubClient::new(&env, &contract_id);

    let creator = Address::generate(&env);

    client.register_creator(
        &creator,
        &String::from_str(&env, "ipfs://profile"),
        &100.into()
    );

    let creators = CreatorHub::read_creators(&env);
    assert!(creators.get(creator).is_some());
}

#[test]
fn test_mint_content() {
    let env = Env::default();
    let contract_id = env.register_contract(None, CreatorHub);
    let client = CreatorHubClient::new(&env, &contract_id);

    let creator = Address::generate(&env);

    let id = client.mint_content(
        &creator,
        &String::from_str(&env, "cid-hash"),
        &50.into(),
        &true
    );

    let contents = CreatorHub::read_contents(&env);
    assert!(contents.get(id).is_some());
}
