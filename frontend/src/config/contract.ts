import CovertArbitrageDeckABI from '../contracts/CovertArbitrageDeck.json';

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xd7352dAC0D73358c32C53b132Bf0d3005ECB1077';

export const CONTRACT_ABI = CovertArbitrageDeckABI.abi;

export const CHAIN_ID = 11155111; // Sepolia

export const SEPOLIA_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
