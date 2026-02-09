use starknet::ContractAddress;

#[derive(Drop, Copy, Serde)]
pub enum Source {
    Nonce: ContractAddress,
    Salt: felt252,
}

#[starknet::interface]
pub trait IVrfProvider<TContractState> {
    fn consume_random(ref self: TContractState, source: Source) -> felt252;
    fn request_random(
        ref self: TContractState, caller: ContractAddress, source: Source,
    );
}
