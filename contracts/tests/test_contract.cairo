use starknet::ContractAddress;
use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address,
    stop_cheat_caller_address, start_cheat_block_timestamp_global,
};

use contracts::pig_nft::{
    IPigNFTDispatcher, IPigNFTDispatcherTrait, IPigNFTSafeDispatcher,
    IPigNFTSafeDispatcherTrait,
};
use contracts::mock_vrf::IMockVrfDispatcher;
use contracts::mock_vrf::IMockVrfDispatcherTrait;

fn OWNER() -> ContractAddress {
    starknet::contract_address_const::<'OWNER'>()
}

fn PLAYER1() -> ContractAddress {
    starknet::contract_address_const::<'PLAYER1'>()
}

fn PLAYER2() -> ContractAddress {
    starknet::contract_address_const::<'PLAYER2'>()
}

fn deploy_mock_vrf() -> ContractAddress {
    let contract = declare("MockVrfProvider").unwrap().contract_class();
    let (address, _) = contract.deploy(@ArrayTrait::new()).unwrap();
    address
}

fn deploy_pig_nft(vrf_address: ContractAddress) -> ContractAddress {
    let contract = declare("PigNFT").unwrap().contract_class();
    let mut calldata = ArrayTrait::new();
    OWNER().serialize(ref calldata);
    vrf_address.serialize(ref calldata);
    let (address, _) = contract.deploy(@calldata).unwrap();
    address
}

fn setup() -> (ContractAddress, ContractAddress) {
    let vrf_addr = deploy_mock_vrf();
    let pig_addr = deploy_pig_nft(vrf_addr);
    (pig_addr, vrf_addr)
}

// Helper: mint pig + start game at given timestamp
fn mint_and_start(pig_addr: ContractAddress, player: ContractAddress, timestamp: u64) {
    let pig = IPigNFTDispatcher { contract_address: pig_addr };
    start_cheat_caller_address(pig_addr, player);
    pig.mint_pig();
    start_cheat_block_timestamp_global(timestamp);
    pig.start_game();
    stop_cheat_caller_address(pig_addr);
}

#[test]
fn test_mint_pig() {
    let (pig_addr, _vrf_addr) = setup();
    let pig = IPigNFTDispatcher { contract_address: pig_addr };

    start_cheat_caller_address(pig_addr, PLAYER1());
    pig.mint_pig();
    stop_cheat_caller_address(pig_addr);

    assert(pig.get_total_supply() == 1, 'supply should be 1');
    let token_id = pig.get_player_pig(PLAYER1());
    assert(token_id == 1, 'token_id should be 1');

    let attrs = pig.get_pig_attributes(1);
    assert(attrs.color_hue < 360, 'hue out of range');
    assert(attrs.speed_bonus <= 20, 'speed out of range');
    assert(attrs.size_scale >= 80 && attrs.size_scale <= 120, 'size out of range');
    assert(attrs.rarity <= 3, 'rarity out of range');
}

#[test]
#[feature("safe_dispatcher")]
fn test_cannot_mint_twice() {
    let (pig_addr, _vrf_addr) = setup();
    let pig = IPigNFTSafeDispatcher { contract_address: pig_addr };

    start_cheat_caller_address(pig_addr, PLAYER1());
    pig.mint_pig().unwrap();
    match pig.mint_pig() {
        Result::Ok(_) => core::panic_with_felt252('should have panicked'),
        Result::Err(_) => {},
    };
    stop_cheat_caller_address(pig_addr);
}

#[test]
fn test_different_random_gives_different_attrs() {
    let vrf_addr = deploy_mock_vrf();
    let pig_addr = deploy_pig_nft(vrf_addr);
    let pig = IPigNFTDispatcher { contract_address: pig_addr };
    let mock_vrf = IMockVrfDispatcher { contract_address: vrf_addr };

    start_cheat_caller_address(pig_addr, PLAYER1());
    pig.mint_pig();
    stop_cheat_caller_address(pig_addr);

    mock_vrf.set_random(987654321);

    start_cheat_caller_address(pig_addr, PLAYER2());
    pig.mint_pig();
    stop_cheat_caller_address(pig_addr);

    let attrs1 = pig.get_pig_attributes(1);
    let attrs2 = pig.get_pig_attributes(2);

    let same = attrs1.color_hue == attrs2.color_hue
        && attrs1.speed_bonus == attrs2.speed_bonus
        && attrs1.size_scale == attrs2.size_scale;
    assert(!same, 'attrs should differ');
}

// ============================================================================
// GAME ROUND TESTS
// ============================================================================

#[test]
fn test_start_game_and_submit_score() {
    let (pig_addr, _vrf_addr) = setup();
    let pig = IPigNFTDispatcher { contract_address: pig_addr };

    start_cheat_caller_address(pig_addr, PLAYER1());
    pig.mint_pig();

    // Start game at t=1000
    start_cheat_block_timestamp_global(1000);
    pig.start_game();

    // Submit score at t=1050 (within 60s)
    start_cheat_block_timestamp_global(1050);
    pig.submit_score(100);
    stop_cheat_caller_address(pig_addr);

    assert(pig.get_player_score(PLAYER1()) == 100, 'score should be 100');
    assert(pig.get_leaderboard_size() == 1, 'lb size should be 1');
    assert(pig.get_games_played(PLAYER1()) == 1, 'games should be 1');
}

#[test]
#[feature("safe_dispatcher")]
fn test_cannot_submit_without_starting() {
    let (pig_addr, _vrf_addr) = setup();
    let pig = IPigNFTSafeDispatcher { contract_address: pig_addr };

    start_cheat_caller_address(pig_addr, PLAYER1());
    pig.mint_pig().unwrap();

    // Try to submit without starting
    match pig.submit_score(100) {
        Result::Ok(_) => core::panic_with_felt252('should have panicked'),
        Result::Err(_) => {},
    };
    stop_cheat_caller_address(pig_addr);
}

#[test]
#[feature("safe_dispatcher")]
fn test_cannot_submit_after_round_expires() {
    let (pig_addr, _vrf_addr) = setup();
    let pig = IPigNFTSafeDispatcher { contract_address: pig_addr };

    start_cheat_caller_address(pig_addr, PLAYER1());
    pig.mint_pig().unwrap();

    // Start game at t=1000
    start_cheat_block_timestamp_global(1000);
    pig.start_game().unwrap();

    // Try to submit at t=1130 (130s later, past 125s limit)
    start_cheat_block_timestamp_global(1130);
    match pig.submit_score(100) {
        Result::Ok(_) => core::panic_with_felt252('should have panicked'),
        Result::Err(_) => {},
    };
    stop_cheat_caller_address(pig_addr);
}

#[test]
fn test_submit_higher_score_updates() {
    let (pig_addr, _vrf_addr) = setup();
    let pig = IPigNFTDispatcher { contract_address: pig_addr };

    start_cheat_caller_address(pig_addr, PLAYER1());
    pig.mint_pig();

    // Round 1: score 100
    start_cheat_block_timestamp_global(1000);
    pig.start_game();
    start_cheat_block_timestamp_global(1050);
    pig.submit_score(100);

    // Round 2: score 200
    start_cheat_block_timestamp_global(2000);
    pig.start_game();
    start_cheat_block_timestamp_global(2050);
    pig.submit_score(200);
    stop_cheat_caller_address(pig_addr);

    assert(pig.get_player_score(PLAYER1()) == 200, 'score should be 200');
    assert(pig.get_games_played(PLAYER1()) == 2, 'games should be 2');
}

// ============================================================================
// ACHIEVEMENT TESTS (on-chain validation)
// ============================================================================

#[test]
fn test_claim_achievement_score_100() {
    let (pig_addr, _vrf_addr) = setup();
    let pig = IPigNFTDispatcher { contract_address: pig_addr };

    start_cheat_caller_address(pig_addr, PLAYER1());
    pig.mint_pig();

    // Play a round and get score 150
    start_cheat_block_timestamp_global(1000);
    pig.start_game();
    start_cheat_block_timestamp_global(1050);
    pig.submit_score(150);

    // Claim "Coin Collector" (score >= 100)
    assert(!pig.has_achievement(PLAYER1(), 0), 'should not have ach');
    pig.claim_achievement(0);
    assert(pig.has_achievement(PLAYER1(), 0), 'should have ach');
    stop_cheat_caller_address(pig_addr);
}

#[test]
#[feature("safe_dispatcher")]
fn test_cannot_claim_achievement_without_score() {
    let (pig_addr, _vrf_addr) = setup();
    let pig = IPigNFTSafeDispatcher { contract_address: pig_addr };

    start_cheat_caller_address(pig_addr, PLAYER1());
    pig.mint_pig().unwrap();

    // Try to claim "Coin Collector" with score 0
    match pig.claim_achievement(0) {
        Result::Ok(_) => core::panic_with_felt252('should have panicked'),
        Result::Err(_) => {},
    };
    stop_cheat_caller_address(pig_addr);
}

#[test]
#[feature("safe_dispatcher")]
fn test_cannot_claim_achievement_twice() {
    let (pig_addr, _vrf_addr) = setup();
    let pig = IPigNFTSafeDispatcher { contract_address: pig_addr };

    start_cheat_caller_address(pig_addr, PLAYER1());
    pig.mint_pig().unwrap();

    // Get score to qualify
    start_cheat_block_timestamp_global(1000);
    pig.start_game().unwrap();
    start_cheat_block_timestamp_global(1050);
    pig.submit_score(150).unwrap();

    pig.claim_achievement(0).unwrap();
    match pig.claim_achievement(0) {
        Result::Ok(_) => core::panic_with_felt252('should have panicked'),
        Result::Err(_) => {},
    };
    stop_cheat_caller_address(pig_addr);
}

// ============================================================================
// DAILY SEED TEST
// ============================================================================

#[test]
fn test_daily_seed_same_day() {
    let (pig_addr, _vrf_addr) = setup();
    let pig = IPigNFTDispatcher { contract_address: pig_addr };

    // Same day, different times
    start_cheat_block_timestamp_global(86400 * 100 + 1000);
    let seed1 = pig.get_daily_seed();
    start_cheat_block_timestamp_global(86400 * 100 + 50000);
    let seed2 = pig.get_daily_seed();
    assert(seed1 == seed2, 'same day same seed');

    // Different day
    start_cheat_block_timestamp_global(86400 * 101 + 1000);
    let seed3 = pig.get_daily_seed();
    assert(seed1 != seed3, 'diff day diff seed');
}
