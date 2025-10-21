import { getAddress, hexlify } from 'ethers';

let fheInstance: any = null;

export const initializeFHE = async (): Promise<any> => {
  if (fheInstance) {
    return fheInstance;
  }

  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }

  try {
    console.log('[FHE] Loading SDK from CDN...');
    
    // 从 CDN 加载 SDK (0.2.0 - 稳定版本)
    const sdk: any = await import('https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js');
    const { initSDK, createInstance, SepoliaConfig } = sdk;

    // 初始化 WASM 模块
    await initSDK();

    // 创建配置
    const config = {
      ...SepoliaConfig,
      network: window.ethereum
    };

    // 创建实例
    fheInstance = await createInstance(config);
    console.log('[FHE] ✅ Instance initialized successfully');
    return fheInstance;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[FHE] ❌ Initialization failed:', errorMsg);
    throw new Error(`FHE initialization failed: ${errorMsg}`);
  }
};

export const getFHEInstance = (): any => {
  return fheInstance;
};

/**
 * Encrypt strategy data (all fields together with shared proof)
 */
export const encryptStrategyData = async (
  capital: bigint,
  exposure: bigint,
  targetReturn: number,
  stopLoss: number,
  maxSlippage: number,
  venueCount: number,
  confidence: number,
  contractAddress: string,
  userAddress: string
): Promise<{
  capitalHandle: string;
  exposureHandle: string;
  targetReturnHandle: string;
  stopLossHandle: string;
  maxSlippageHandle: string;
  venueCountHandle: string;
  confidenceHandle: string;
  signature: string;
}> => {
  let fhe = getFHEInstance();
  if (!fhe) {
    fhe = await initializeFHE();
  }
  if (!fhe) throw new Error('Failed to initialize FHE');

  const contractAddressChecksum = getAddress(contractAddress);
  const ciphertext = await fhe.createEncryptedInput(contractAddressChecksum, userAddress);

  // Add all values in order
  ciphertext.add64(capital);         // euint64
  ciphertext.add64(exposure);        // euint64
  ciphertext.add32(targetReturn);    // euint32
  ciphertext.add32(stopLoss);        // euint32
  ciphertext.add16(maxSlippage);     // euint16
  ciphertext.add8(venueCount);       // euint8
  ciphertext.add8(confidence);       // euint8

  const { handles, inputProof } = await ciphertext.encrypt();

  return {
    capitalHandle: hexlify(handles[0]),
    exposureHandle: hexlify(handles[1]),
    targetReturnHandle: hexlify(handles[2]),
    stopLossHandle: hexlify(handles[3]),
    maxSlippageHandle: hexlify(handles[4]),
    venueCountHandle: hexlify(handles[5]),
    confidenceHandle: hexlify(handles[6]),
    signature: hexlify(inputProof)
  };
};

/**
 * Request reencryption for viewing encrypted data
 */
export const requestReencryption = async (
  handle: string,
  publicKey: string,
  contractAddress: string
): Promise<bigint> => {
  const fhe = getFHEInstance();
  if (!fhe) throw new Error('FHE not initialized');

  try {
    const reencrypted = await fhe.reencrypt(
      handle,
      publicKey,
      contractAddress
    );
    return BigInt(reencrypted);
  } catch (error) {
    console.error('Reencryption failed:', error);
    throw error;
  }
};
