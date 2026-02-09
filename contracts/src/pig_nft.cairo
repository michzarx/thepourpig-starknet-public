use starknet::ContractAddress;

#[derive(Drop, Copy, Serde, starknet::Store)]
pub struct PigAttributes {
    pub color_hue: u16,
    pub speed_bonus: u8,
    pub size_scale: u8,
    pub rarity: u8,
}

#[derive(Drop, Copy, Serde, starknet::Store)]
pub struct LeaderboardEntry {
    pub player: ContractAddress,
    pub score: u32,
}

#[starknet::interface]
pub trait IPigNFT<TContractState> {
    // Write
    fn mint_pig(ref self: TContractState);
    fn start_game(ref self: TContractState);
    fn submit_score(ref self: TContractState, score: u32);
    fn claim_achievement(ref self: TContractState, achievement_id: u8);
    // Read
    fn get_pig_attributes(self: @TContractState, token_id: u256) -> PigAttributes;
    fn get_player_pig(self: @TContractState, player: ContractAddress) -> u256;
    fn get_player_score(self: @TContractState, player: ContractAddress) -> u32;
    fn get_leaderboard_entry(self: @TContractState, rank: u32) -> LeaderboardEntry;
    fn get_leaderboard_size(self: @TContractState) -> u32;
    fn has_achievement(
        self: @TContractState, player: ContractAddress, achievement_id: u8,
    ) -> bool;
    fn get_total_supply(self: @TContractState) -> u256;
    fn get_game_start(self: @TContractState, player: ContractAddress) -> u64;
    fn get_daily_seed(self: @TContractState) -> felt252;
    fn get_games_played(self: @TContractState, player: ContractAddress) -> u32;
}

#[starknet::contract]
mod PigNFT {
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address, get_contract_address, get_block_timestamp};
    use core::poseidon::poseidon_hash_span;
    use openzeppelin_token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use openzeppelin_introspection::src5::SRC5Component;
    use openzeppelin_access::ownable::OwnableComponent;
    use super::{PigAttributes, LeaderboardEntry};
    use crate::vrf_provider::{IVrfProviderDispatcher, IVrfProviderDispatcherTrait, Source};

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl ERC721MixinImpl = ERC721Component::ERC721MixinImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    const MAX_LEADERBOARD: u32 = 10;
    const ROUND_DURATION: u64 = 120; // 120 seconds grace for tx confirmation
    const SECONDS_PER_DAY: u64 = 86400;

    #[storage]
    struct Storage {
        vrf_provider: ContractAddress,
        total_supply: u256,
        // Pig attributes
        pig_attributes: Map<u256, PigAttributes>,
        player_pig: Map<ContractAddress, u256>,
        has_pig: Map<ContractAddress, bool>,
        // Game rounds
        game_start: Map<ContractAddress, u64>,
        games_played: Map<ContractAddress, u32>,
        // Leaderboard
        leaderboard: Map<u32, LeaderboardEntry>,
        leaderboard_size: u32,
        player_scores: Map<ContractAddress, u32>,
        // Achievements
        achievements: Map<(ContractAddress, u8), bool>,
        // Components
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PigMinted: PigMinted,
        GameStarted: GameStarted,
        ScoreSubmitted: ScoreSubmitted,
        AchievementClaimed: AchievementClaimed,
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    struct PigMinted {
        #[key]
        player: ContractAddress,
        token_id: u256,
        color_hue: u16,
        speed_bonus: u8,
        size_scale: u8,
        rarity: u8,
    }

    #[derive(Drop, starknet::Event)]
    struct GameStarted {
        #[key]
        player: ContractAddress,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct ScoreSubmitted {
        #[key]
        player: ContractAddress,
        score: u32,
        rank: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct AchievementClaimed {
        #[key]
        player: ContractAddress,
        achievement_id: u8,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        vrf_provider: ContractAddress,
    ) {
        self.erc721.initializer("The Pour Pig", "PIG", "");
        self.ownable.initializer(owner);
        self.vrf_provider.write(vrf_provider);
        self.total_supply.write(0);
        self.leaderboard_size.write(0);
    }

    fn derive_attributes(random: felt252) -> PigAttributes {
        let r: u256 = random.into();
        let color_hue: u16 = (r % 360).try_into().unwrap();
        let speed_bonus: u8 = ((r / 360) % 21).try_into().unwrap();
        let size_scale: u8 = ((r / 7560) % 41 + 80).try_into().unwrap();
        let rarity_roll: u8 = ((r / 309960) % 100).try_into().unwrap();

        let rarity = if rarity_roll < 5 {
            3_u8 // legendary (5%)
        } else if rarity_roll < 15 {
            2_u8 // rare (10%)
        } else if rarity_roll < 40 {
            1_u8 // uncommon (25%)
        } else {
            0_u8 // common (60%)
        };

        PigAttributes { color_hue, speed_bonus, size_scale, rarity }
    }

    #[abi(embed_v0)]
    impl PigNFTImpl of super::IPigNFT<ContractState> {
        fn mint_pig(ref self: ContractState) {
            let caller = get_caller_address();
            assert!(!self.has_pig.entry(caller).read(), "ALREADY_HAS_PIG");

            let vrf = IVrfProviderDispatcher {
                contract_address: self.vrf_provider.read(),
            };
            let random = vrf.consume_random(Source::Nonce(get_contract_address()));

            let attrs = derive_attributes(random);

            let token_id = self.total_supply.read() + 1;
            self.total_supply.write(token_id);
            self.erc721.mint(caller, token_id);

            self.pig_attributes.entry(token_id).write(attrs);
            self.player_pig.entry(caller).write(token_id);
            self.has_pig.entry(caller).write(true);

            self
                .emit(
                    PigMinted {
                        player: caller,
                        token_id,
                        color_hue: attrs.color_hue,
                        speed_bonus: attrs.speed_bonus,
                        size_scale: attrs.size_scale,
                        rarity: attrs.rarity,
                    },
                );
        }

        fn start_game(ref self: ContractState) {
            let caller = get_caller_address();
            assert!(self.has_pig.entry(caller).read(), "NO_PIG");

            let now = get_block_timestamp();
            self.game_start.entry(caller).write(now);

            let played = self.games_played.entry(caller).read();
            self.games_played.entry(caller).write(played + 1);

            self.emit(GameStarted { player: caller, timestamp: now });
        }

        fn submit_score(ref self: ContractState, score: u32) {
            let caller = get_caller_address();
            assert!(self.has_pig.entry(caller).read(), "NO_PIG");

            // Verify game was started and round hasn't expired
            let start = self.game_start.entry(caller).read();
            assert!(start > 0, "GAME_NOT_STARTED");
            let now = get_block_timestamp();
            assert!(now - start <= ROUND_DURATION + 5, "ROUND_EXPIRED");

            // Reset game start so same round can't submit twice
            self.game_start.entry(caller).write(0);

            let current_best = self.player_scores.entry(caller).read();
            if score <= current_best {
                return;
            }

            self.player_scores.entry(caller).write(score);

            // Update leaderboard
            let size = self.leaderboard_size.read();
            let mut rank: u32 = size;

            let mut i: u32 = 0;
            loop {
                if i >= size {
                    break;
                }
                let entry = self.leaderboard.entry(i).read();
                if entry.player == caller {
                    let mut j = i;
                    loop {
                        if j + 1 >= size {
                            break;
                        }
                        let next = self.leaderboard.entry(j + 1).read();
                        self.leaderboard.entry(j).write(next);
                        j += 1;
                    };
                    rank = size - 1;
                    break;
                }
                i += 1;
            };

            let effective_size = if rank < size {
                rank
            } else {
                size
            };
            let mut insert_pos: u32 = effective_size;
            let mut k: u32 = 0;
            loop {
                if k >= effective_size {
                    break;
                }
                let entry = self.leaderboard.entry(k).read();
                if score > entry.score {
                    insert_pos = k;
                    break;
                }
                k += 1;
            };

            if insert_pos < MAX_LEADERBOARD {
                let new_size = if effective_size < MAX_LEADERBOARD {
                    effective_size + 1
                } else {
                    MAX_LEADERBOARD
                };

                let mut m: u32 = new_size - 1;
                loop {
                    if m <= insert_pos {
                        break;
                    }
                    let prev = self.leaderboard.entry(m - 1).read();
                    self.leaderboard.entry(m).write(prev);
                    m -= 1;
                };

                self
                    .leaderboard
                    .entry(insert_pos)
                    .write(LeaderboardEntry { player: caller, score });
                self.leaderboard_size.write(new_size);

                self.emit(ScoreSubmitted { player: caller, score, rank: insert_pos });
            }
        }

        fn claim_achievement(ref self: ContractState, achievement_id: u8) {
            let caller = get_caller_address();
            assert!(self.has_pig.entry(caller).read(), "NO_PIG");
            assert!(achievement_id <= 3, "INVALID_ACHIEVEMENT");
            assert!(
                !self.achievements.entry((caller, achievement_id)).read(),
                "ALREADY_CLAIMED",
            );

            // On-chain validation of achievement conditions
            let score = self.player_scores.entry(caller).read();
            let games = self.games_played.entry(caller).read();

            if achievement_id == 0 {
                // "Coin Collector" — score >= 100
                assert!(score >= 100, "SCORE_TOO_LOW");
            } else if achievement_id == 1 {
                // "Coin Master" — score >= 500
                assert!(score >= 500, "SCORE_TOO_LOW");
            } else if achievement_id == 2 {
                // "Veteran" — played 10+ games
                assert!(games >= 10, "NOT_ENOUGH_GAMES");
            } else {
                // "Legend" — score >= 1000
                assert!(score >= 1000, "SCORE_TOO_LOW");
            }

            self.achievements.entry((caller, achievement_id)).write(true);

            self.emit(AchievementClaimed { player: caller, achievement_id });
        }

        fn get_pig_attributes(self: @ContractState, token_id: u256) -> PigAttributes {
            self.pig_attributes.entry(token_id).read()
        }

        fn get_player_pig(self: @ContractState, player: ContractAddress) -> u256 {
            self.player_pig.entry(player).read()
        }

        fn get_player_score(self: @ContractState, player: ContractAddress) -> u32 {
            self.player_scores.entry(player).read()
        }

        fn get_leaderboard_entry(self: @ContractState, rank: u32) -> LeaderboardEntry {
            self.leaderboard.entry(rank).read()
        }

        fn get_leaderboard_size(self: @ContractState) -> u32 {
            self.leaderboard_size.read()
        }

        fn has_achievement(
            self: @ContractState, player: ContractAddress, achievement_id: u8,
        ) -> bool {
            self.achievements.entry((player, achievement_id)).read()
        }

        fn get_total_supply(self: @ContractState) -> u256 {
            self.total_supply.read()
        }

        fn get_game_start(self: @ContractState, player: ContractAddress) -> u64 {
            self.game_start.entry(player).read()
        }

        // Daily seed: deterministic from block_timestamp / 86400 (day number)
        // All players get the same seed on the same day → same coin positions
        fn get_daily_seed(self: @ContractState) -> felt252 {
            let day: u64 = get_block_timestamp() / SECONDS_PER_DAY;
            let day_felt: felt252 = day.into();
            poseidon_hash_span(array!['POUR_PIG_DAILY', day_felt].span())
        }

        fn get_games_played(self: @ContractState, player: ContractAddress) -> u32 {
            self.games_played.entry(player).read()
        }
    }
}
