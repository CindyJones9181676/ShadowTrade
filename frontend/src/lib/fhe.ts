import { bytesToHex, getAddress } from "viem";
import type { Address } from "viem";
import { CONTRACT_ADDRESS } from "@/config/contract";

declare global {
    interface Window {
        RelayerSDK?: any;
        relayerSDK?: any;
        ethereum?: any;
        okxwallet?: any;
    }
}

let fheInstance: any = null;

const getSDK = () => {
    if (typeof window === "undefined") {
        throw new Error("FHE SDK requires a browser environment");
    }
    const sdk = window.RelayerSDK || window.relayerSDK;
    if (!sdk) {
        throw new Error("Relayer SDK not loaded. Ensure the CDN script tag is present.");
    }
    return sdk;
};

export const initializeFHE = async (provider?: any) => {
    if (fheInstance) return fheInstance;
    if (typeof window === "undefined") {
        throw new Error("FHE SDK requires a browser environment");
    }

    const ethereumProvider =
        provider || window.ethereum || window.okxwallet?.provider || window.okxwallet;
    if (!ethereumProvider) {
        throw new Error("No wallet provider detected. Connect a wallet first.");
    }

    const sdk = getSDK();
    const { initSDK, createInstance, SepoliaConfig } = sdk;
    await initSDK();
    const config = { ...SepoliaConfig, network: ethereumProvider };
    fheInstance = await createInstance(config);
    return fheInstance;
};

const getInstance = async (provider?: any) => {
    if (fheInstance) return fheInstance;
    return initializeFHE(provider);
};

/**
 * Encrypt strategy parameters for CovertArbitrageDeck contract
 * @param userAddress - The user's wallet address
 * @param params - Strategy parameters to encrypt
 * @param provider - Optional ethereum provider
 */
export const encryptStrategyParams = async (
    userAddress: Address,
    params: {
        capital: bigint;
        exposure: bigint;
        targetReturnBps: number;
        stopLossBps: number;
        maxSlippageBps: number;
        venueCount: number;
        confidence: number;
    },
    provider?: any
): Promise<{
    handles: `0x${string}`[];
    proof: `0x${string}`;
}> => {
    console.log('[FHE] Encrypting strategy parameters...');
    const instance = await getInstance(provider);
    const contractAddr = getAddress(CONTRACT_ADDRESS);
    const userAddr = getAddress(userAddress);

    console.log('[FHE] Creating encrypted input for:', {
        contract: contractAddr,
        user: userAddr,
    });

    const input = instance.createEncryptedInput(contractAddr, userAddr);

    // Add all parameters in order (euint64, euint64, euint32, euint32, euint16, euint8, euint8)
    input.add64(params.capital);           // capital
    input.add64(params.exposure);          // exposure
    input.add32(params.targetReturnBps);   // targetReturnBps
    input.add32(params.stopLossBps);       // stopLossBps
    input.add16(params.maxSlippageBps);    // maxSlippageBps
    input.add8(params.venueCount);         // venueCount
    input.add8(params.confidence);         // confidence

    console.log('[FHE] Encrypting input...');
    const { handles, inputProof } = await input.encrypt();
    console.log('[FHE] Encryption complete, handles:', handles.length);
    console.log('[FHE] Handle types:', handles.map((h: any) => ({
        type: typeof h,
        isUint8Array: h instanceof Uint8Array,
        length: h?.length || h?.byteLength,
        value: h
    })));
    console.log('[FHE] inputProof type:', typeof inputProof, inputProof instanceof Uint8Array);

    if (handles.length < 7) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    // Convert handles - they may already be hex strings or need conversion
    const convertedHandles = handles.map((h: any, idx: number) => {
        let hex: string;
        if (typeof h === 'string') {
            hex = h.startsWith('0x') ? h : `0x${h}`;
        } else if (h instanceof Uint8Array) {
            hex = bytesToHex(h);
        } else if (typeof h === 'bigint') {
            hex = `0x${h.toString(16).padStart(64, '0')}`;
        } else {
            console.error(`[FHE] Unknown handle type at index ${idx}:`, h);
            throw new Error(`Unknown handle type at index ${idx}`);
        }
        console.log(`[FHE] Handle ${idx}: ${hex} (length: ${hex.length})`);
        return hex as `0x${string}`;
    });

    // Convert proof
    let proofHex: string;
    if (typeof inputProof === 'string') {
        proofHex = inputProof.startsWith('0x') ? inputProof : `0x${inputProof}`;
    } else if (inputProof instanceof Uint8Array) {
        proofHex = bytesToHex(inputProof);
    } else {
        console.error('[FHE] Unknown proof type:', inputProof);
        throw new Error('Unknown proof type');
    }
    console.log(`[FHE] Proof: ${proofHex.slice(0, 66)}... (length: ${proofHex.length})`);

    return {
        handles: convertedHandles,
        proof: proofHex as `0x${string}`,
    };
};

/**
 * Encrypt execution parameters for recording trades
 * @param userAddress - The user's wallet address
 * @param amount - Trade amount
 * @param pnl - Profit/Loss amount
 * @param provider - Optional ethereum provider
 */
export const encryptExecutionParams = async (
    userAddress: Address,
    amount: bigint,
    pnl: bigint,
    provider?: any
): Promise<{
    amountHandle: `0x${string}`;
    pnlHandle: `0x${string}`;
    proof: `0x${string}`;
}> => {
    console.log('[FHE] Encrypting execution parameters...');
    const instance = await getInstance(provider);
    const contractAddr = getAddress(CONTRACT_ADDRESS);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add64(amount);
    input.add64(pnl);

    const { handles, inputProof } = await input.encrypt();

    if (handles.length < 2) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        amountHandle: bytesToHex(handles[0]) as `0x${string}`,
        pnlHandle: bytesToHex(handles[1]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Encrypt a single uint64 value
 */
export const encryptUint64 = async (
    userAddress: Address,
    value: bigint,
    provider?: any
): Promise<{
    handle: `0x${string}`;
    proof: `0x${string}`;
}> => {
    const instance = await getInstance(provider);
    const contractAddr = getAddress(CONTRACT_ADDRESS);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add64(value);

    const { handles, inputProof } = await input.encrypt();

    return {
        handle: bytesToHex(handles[0]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Public decrypt using self-relaying pattern (fhEVM 0.9.1)
 * @param ciphertextHandle - The ciphertext handle to decrypt
 */
export const publicDecrypt = async (
    ciphertextHandle: `0x${string}`
): Promise<bigint> => {
    const sdk = getSDK();
    const result = await sdk.publicDecrypt(ciphertextHandle);
    return BigInt(result);
};

/**
 * Check if FHE SDK is loaded and ready
 */
export const isFHEReady = (): boolean => {
    if (typeof window === "undefined") return false;
    return !!(window.RelayerSDK || window.relayerSDK);
};

// Alias for compatibility
export const isFheReady = (): boolean => {
    return fheInstance !== null;
};

export const isSDKLoaded = isFHEReady;

/**
 * Wait for FHE SDK to be loaded (with timeout)
 */
export const waitForFHE = async (timeoutMs: number = 10000): Promise<boolean> => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        if (isFHEReady()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
};

/**
 * Get FHE status for debugging
 */
export const getFHEStatus = (): {
    sdkLoaded: boolean;
    instanceReady: boolean;
} => {
    return {
        sdkLoaded: isFHEReady(),
        instanceReady: fheInstance !== null,
    };
};

/**
 * Get FHE instance (for advanced usage)
 */
export const getFHEInstance = (): any => fheInstance;

// ============ Legacy API compatibility ============

/**
 * Encrypt policy limit (for CrypticBenefitNetworkV2 compatibility)
 * @param maxAmount - Maximum amount to encrypt
 * @param contractAddress - Contract address
 * @param userAddress - User wallet address
 */
export const encryptPolicyLimit = async (
    maxAmount: bigint | number | string,
    contractAddress: string,
    userAddress: string
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> => {
    const instance = await getInstance();
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add64(BigInt(maxAmount));

    const { handles, inputProof } = await input.encrypt();

    return {
        handle: bytesToHex(handles[0]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Encrypt benefit amount (for CrypticBenefitNetworkV2 compatibility)
 * @param amount - Amount to encrypt
 * @param contractAddress - Contract address
 * @param userAddress - User wallet address
 */
export const encryptBenefitAmount = async (
    amount: bigint | number | string,
    contractAddress: string,
    userAddress: string
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> => {
    const instance = await getInstance();
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add64(BigInt(amount));

    const { handles, inputProof } = await input.encrypt();

    return {
        handle: bytesToHex(handles[0]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};
