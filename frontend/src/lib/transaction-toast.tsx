import { toast } from 'sonner';
import { ExternalLink, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { CHAIN_ID } from '@/config/contract';

// Block explorer URL based on chain ID
const getExplorerUrl = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return 'https://etherscan.io';
    case 11155111:
      return 'https://sepolia.etherscan.io';
    case 8453:
      return 'https://basescan.org';
    case 84532:
      return 'https://sepolia.basescan.org';
    case 137:
      return 'https://polygonscan.com';
    case 80001:
      return 'https://mumbai.polygonscan.com';
    default:
      return 'https://sepolia.etherscan.io';
  }
};

// Get transaction URL
export const getTxUrl = (hash: string, chainId: number = CHAIN_ID): string => {
  return `${getExplorerUrl(chainId)}/tx/${hash}`;
};

// Get address URL
export const getAddressUrl = (address: string, chainId: number = CHAIN_ID): string => {
  return `${getExplorerUrl(chainId)}/address/${address}`;
};

// Transaction link component for toast
const TxLink = ({ hash, chainId = CHAIN_ID }: { hash: string; chainId?: number }) => (
  <a
    href={getTxUrl(hash, chainId)}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-xs mt-1"
    onClick={(e) => e.stopPropagation()}
  >
    {hash.slice(0, 10)}...{hash.slice(-8)}
    <ExternalLink className="h-3 w-3" />
  </a>
);

// Toast for transaction submitted (waiting for confirmation)
export const toastTxSubmitted = (hash: string, message?: string, chainId: number = CHAIN_ID) => {
  return toast(
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span className="font-medium">{message || 'Transaction Submitted'}</span>
      </div>
      <p className="text-sm text-muted-foreground">Waiting for confirmation...</p>
      <TxLink hash={hash} chainId={chainId} />
    </div>,
    {
      duration: Infinity,
      id: `tx-${hash}`,
    }
  );
};

// Toast for transaction confirmed (success)
export const toastTxSuccess = (hash: string, message?: string, chainId: number = CHAIN_ID) => {
  // Dismiss the pending toast first
  toast.dismiss(`tx-${hash}`);

  return toast.success(
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span className="font-medium">{message || 'Transaction Confirmed'}</span>
      </div>
      <TxLink hash={hash} chainId={chainId} />
    </div>,
    {
      duration: 8000,
      id: `tx-success-${hash}`,
    }
  );
};

// Toast for transaction failed
export const toastTxError = (hash: string | undefined, error: Error | string, chainId: number = CHAIN_ID) => {
  // Dismiss the pending toast if hash exists
  if (hash) {
    toast.dismiss(`tx-${hash}`);
  }

  const errorMessage = typeof error === 'string' ? error : error.message;

  // Parse common error messages
  let displayMessage = errorMessage;
  if (errorMessage.includes('user rejected')) {
    displayMessage = 'Transaction rejected by user';
  } else if (errorMessage.includes('insufficient funds')) {
    displayMessage = 'Insufficient funds for transaction';
  } else if (errorMessage.includes('nonce')) {
    displayMessage = 'Transaction nonce error, please try again';
  } else if (errorMessage.length > 100) {
    displayMessage = errorMessage.slice(0, 100) + '...';
  }

  return toast.error(
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-red-500" />
        <span className="font-medium">Transaction Failed</span>
      </div>
      <p className="text-sm text-muted-foreground">{displayMessage}</p>
      {hash && <TxLink hash={hash} chainId={chainId} />}
    </div>,
    {
      duration: 10000,
      id: hash ? `tx-error-${hash}` : undefined,
    }
  );
};

// Toast for transaction reverted (on-chain failure)
export const toastTxReverted = (hash: string, reason?: string, chainId: number = CHAIN_ID) => {
  // Dismiss the pending toast
  toast.dismiss(`tx-${hash}`);

  return toast.error(
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-red-500" />
        <span className="font-medium">Transaction Reverted</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {reason || 'The transaction was reverted by the contract'}
      </p>
      <TxLink hash={hash} chainId={chainId} />
    </div>,
    {
      duration: 10000,
      id: `tx-reverted-${hash}`,
    }
  );
};

// Helper hook for wagmi transaction handling
export const useTransactionToast = () => {
  return {
    onSubmitted: toastTxSubmitted,
    onSuccess: toastTxSuccess,
    onError: toastTxError,
    onReverted: toastTxReverted,
  };
};
