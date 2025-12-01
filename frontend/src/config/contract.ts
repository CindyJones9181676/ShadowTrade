import CovertArbitrageDeck from '../contracts/CovertArbitrageDeck.json';

export const CONTRACT_ADDRESS = import.meta.env.VITE_CBN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export const CONTRACT_ABI = CovertArbitrageDeck.abi;

export const CHAIN_ID = 11155111; // Sepolia

export const SEPOLIA_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
