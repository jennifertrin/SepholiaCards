#![allow(dead_code)]

mod user_profile;

use candid::Principal;
use ic_cdk::{init, post_upgrade, query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use serde_bytes::ByteBuf;
use std::cell::RefCell;
use std::time::Duration;
use user_profile::UserProfile;

type Memory = VirtualMemory<DefaultMemoryImpl>;

extern crate ic_siwe;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static USER_PROFILES: RefCell<StableBTreeMap<String, UserProfile, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );
}

// This guard require that the user has a user profile before being able to call the function.
fn profile_guard() -> Result<(), String> {
    USER_PROFILES.with(|p| {
        if !p.borrow().contains_key(&ic_cdk::caller().to_string()) {
            return Err("No profile found for the given address".to_string());
        }
        Ok(())
    })
}

#[query(guard = profile_guard)]
fn get_my_profile() -> Result<UserProfile, String> {
    USER_PROFILES
        .with(|p| p.borrow().get(&ic_cdk::caller().to_string()))
        .map_or(
            Err("No profile found for the given address".to_string()),
            |p| Ok(p),
        )
}

#[update(guard = profile_guard)]
fn save_my_profile(name: String, avatar_url: String) -> Result<String, String> {
    let caller = ic_cdk::caller().to_string();

    USER_PROFILES.with(|p| {
        let mut profiles = p.borrow_mut();

        if profiles.contains_key(&caller) {
            // Retrieve and update the profile
            let mut profile = profiles.get(&caller).expect("Profile not found").clone();
            profile.name = name;
            profile.avatar_url = avatar_url;

            // Re-insert the updated profile
            profiles.insert(caller, profile);
            Ok("Profile saved".to_string())
        } else {
            Err("Profile not found".to_string())
        }
    })
}

#[query(guard = profile_guard)]
fn list_profiles() -> Result<Vec<(String, UserProfile)>, String> {
    let profiles = USER_PROFILES.with(|p| p.borrow().iter().collect::<Vec<_>>());
    Ok(profiles)
}

// Prepare the login by generating a challenge (the SIWE message) and returning it to the caller.
#[update]
fn prepare_login(address: String) -> Result<String, String> {
    ic_siwe::login::prepare_login(&address).map(|m| m.into())
}

// Login the user by verifying the signature of the SIWE message. If the signature is valid, the
// public key is returned. In this step, the delegation is also prepared to be fetched in the next
// step.
#[update]
fn login(signature: String, address: String, session_key: ByteBuf) -> Result<ByteBuf, String> {
    match ic_siwe::login::login(&signature, &address, session_key) {
        Ok(pk) => {
            // Convert the public key to a principal as this is the principal that will be used
            // for authentication.
            let principal = Principal::self_authenticating(&pk.user_canister_pubkey).to_string();

            // Create a new user profile for the user if it doesn't exist yet.
            USER_PROFILES.with(|p| {
                let mut profiles = p.borrow_mut();

                if !profiles.contains_key(&principal) {
                    let profile = UserProfile {
                        address,
                        name: "No Name".to_string(),
                        avatar_url: "".to_string(),
                    };

                    // Re-insert the updated profile
                    profiles.insert(principal, profile);
                }
            });

            Ok(pk.user_canister_pubkey.into())
        }
        Err(e) => Err(e.to_string()),
    }
}

// Once logged in, the user can fetch the delegation to be used for authentication.
#[query]
fn get_delegation(
    address: String,
    session_key: ByteBuf,
    expiration: u64,
) -> Result<ic_siwe::delegation::SignedDelegationCandidType, String> {
    ic_siwe::login::get_delegation(&address, session_key, expiration)
}

// ic-siwe provides default values for all settings except the domain, uri and salt.
fn siwe_init() {
    ic_siwe::init(
        ic_siwe::settings::SettingsBuilder::new("127.0.0.1", "http://127.0.0.1:4943", "salt")
            .scheme("http")
            .statement("Login to the app")
            .sign_in_expires_in(Duration::from_secs(60 * 5).as_nanos() as u64) // 5 minutes
            .session_expires_in(Duration::from_secs(60 * 60).as_nanos() as u64) // 1 hour
            .build()
            .unwrap(),
    )
    .unwrap();
}

// The siwe_init function is called when the canister is created to initialize the SIWE library.
#[init]
fn init() {
    siwe_init();
}

// Make sure to call the init function after upgrading the canister.
#[post_upgrade]
fn upgrade() {
    siwe_init();
}