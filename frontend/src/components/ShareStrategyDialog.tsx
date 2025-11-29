import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { isAddress } from 'viem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { toastTxSubmitted, toastTxSuccess, toastTxError } from '@/lib/transaction-toast';
import { toast } from 'sonner';
import { Share2, X, UserPlus, Users } from 'lucide-react';

interface ShareStrategyDialogProps {
  strategyId: string;
  onShared?: () => void;
}

const ShareStrategyDialog = ({ strategyId, onShared }: ShareStrategyDialogProps) => {
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const submittedHashRef = useRef<string | null>(null);

  // Get shared users
  const { data: sharedUsers, refetch: refetchSharedUsers } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getStrategySharedUsers',
    args: [strategyId as `0x${string}`],
    query: {
      enabled: open && !!address,
    },
  });

  // Share contract call
  const {
    writeContract: shareWrite,
    data: shareHash,
    isPending: isSharePending,
    error: shareError,
  } = useWriteContract();

  const {
    isLoading: isShareConfirming,
    isSuccess: isShareSuccess,
    isError: isShareError,
    error: shareReceiptError,
  } = useWaitForTransactionReceipt({ hash: shareHash });

  // Revoke contract call
  const {
    writeContract: revokeWrite,
    data: revokeHash,
    isPending: isRevokePending,
    error: revokeError,
  } = useWriteContract();

  const {
    isLoading: isRevokeConfirming,
    isSuccess: isRevokeSuccess,
    isError: isRevokeError,
    error: revokeReceiptError,
  } = useWaitForTransactionReceipt({ hash: revokeHash });

  // Handle share transaction
  useEffect(() => {
    if (shareHash && shareHash !== submittedHashRef.current) {
      submittedHashRef.current = shareHash;
      toastTxSubmitted(shareHash, 'Share Transaction Submitted');
    }
  }, [shareHash]);

  useEffect(() => {
    if (isShareSuccess && shareHash) {
      toastTxSuccess(shareHash, 'Strategy Shared Successfully');
      submittedHashRef.current = null;
      setRecipientAddress('');
      refetchSharedUsers();
      onShared?.();
    }
  }, [isShareSuccess, shareHash, onShared, refetchSharedUsers]);

  useEffect(() => {
    if (shareError) {
      toastTxError(undefined, shareError);
      submittedHashRef.current = null;
    }
  }, [shareError]);

  useEffect(() => {
    if (isShareError && shareHash) {
      toastTxError(shareHash, shareReceiptError?.message || 'Share transaction failed');
      submittedHashRef.current = null;
    }
  }, [isShareError, shareHash, shareReceiptError]);

  // Handle revoke transaction
  useEffect(() => {
    if (revokeHash && revokeHash !== submittedHashRef.current) {
      submittedHashRef.current = revokeHash;
      toastTxSubmitted(revokeHash, 'Revoke Transaction Submitted');
    }
  }, [revokeHash]);

  useEffect(() => {
    if (isRevokeSuccess && revokeHash) {
      toastTxSuccess(revokeHash, 'Access Revoked Successfully');
      submittedHashRef.current = null;
      refetchSharedUsers();
      onShared?.();
    }
  }, [isRevokeSuccess, revokeHash, onShared, refetchSharedUsers]);

  useEffect(() => {
    if (revokeError) {
      toastTxError(undefined, revokeError);
      submittedHashRef.current = null;
    }
  }, [revokeError]);

  useEffect(() => {
    if (isRevokeError && revokeHash) {
      toastTxError(revokeHash, revokeReceiptError?.message || 'Revoke transaction failed');
      submittedHashRef.current = null;
    }
  }, [isRevokeError, revokeHash, revokeReceiptError]);

  const handleShare = () => {
    if (!recipientAddress || !isAddress(recipientAddress)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    if (recipientAddress.toLowerCase() === address?.toLowerCase()) {
      toast.error('Cannot share with yourself');
      return;
    }

    shareWrite({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'shareStrategy',
      args: [strategyId as `0x${string}`, recipientAddress as `0x${string}`],
    });
  };

  const handleRevoke = (userAddress: string) => {
    revokeWrite({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'revokeShare',
      args: [strategyId as `0x${string}`, userAddress as `0x${string}`],
    });
  };

  const isActionPending = isSharePending || isShareConfirming || isRevokePending || isRevokeConfirming;
  const sharedUsersList = (sharedUsers as string[]) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-3 h-3 mr-1" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Strategy
          </DialogTitle>
          <DialogDescription>
            Share this strategy with other users. They will have read-only access to view encrypted parameters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share with new user */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Share with Address</Label>
            <div className="flex gap-2">
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                disabled={isActionPending}
              />
              <Button onClick={handleShare} disabled={isActionPending || !recipientAddress}>
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Shared users list */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Shared With ({sharedUsersList.length})
            </Label>
            {sharedUsersList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Not shared with anyone yet
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {sharedUsersList.map((userAddr) => (
                    <div
                      key={userAddr}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {userAddr.slice(0, 6)}...{userAddr.slice(-4)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(userAddr)}
                        disabled={isActionPending}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Strategy ID display */}
          <div className="pt-2 border-t">
            <Label className="text-xs text-muted-foreground">Strategy ID</Label>
            <p className="font-mono text-xs break-all">{strategyId}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareStrategyDialog;
