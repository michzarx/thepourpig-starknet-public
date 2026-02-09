use starknet::ContractAddress;
use crate::vrf_provider::Source;

#[starknet::interface]
pub trait IMockVrf<TContractState> {
    fn set_random(ref self: TContractState, value: felt252);
}

#[starknet::contract]
pub mod MockVrfProvider {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::ContractAddress;
    use crate::vrf_provider::Source;

    #[storage]
    struct Storage {
        random_value: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.random_value.write(123456789);
    }

    #[abi(embed_v0)]
    impl MockVrfImpl of super::IMockVrf<ContractState> {
        fn set_random(ref self: ContractState, value: felt252) {
            self.random_value.write(value);
        }
    }

    #[abi(embed_v0)]
    impl VrfProviderImpl of crate::vrf_provider::IVrfProvider<ContractState> {
        fn consume_random(ref self: ContractState, source: Source) -> felt252 {
            self.random_value.read()
        }

        fn request_random(
            ref self: ContractState, caller: ContractAddress, source: Source,
        ) {}
    }
}
