import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { initializeFHE, encryptStrategyData } from '@/lib/fhe';
import { Loader2 } from 'lucide-react';

const CreateStrategyForm = () => {
  const { address } = useAccount();
  const [fheInitialized, setFheInitialized] = useState(false);

  const [formData, setFormData] = useState({
    capital: '',
    exposure: '',
    targetReturn: '',
    stopLoss: '',
    maxSlippage: '',
    venueCount: '3',
    confidence: '75',
    opportunityType: '0',
    riskTier: '1',
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const initFHE = async () => {
      try {
        await initializeFHE();
        setFheInitialized(true);
        console.log('FHE initialized');
      } catch (error) {
        console.error('Failed to initialize FHE:', error);
        toast.error('Failed to initialize encryption system');
      }
    };

    if (address) {
      initFHE();
    }
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fheInitialized) {
      toast.error('Encryption system not ready');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      toast.info('Encrypting strategy parameters with FHE...');

      // Convert values
      const capitalWei = parseEther(formData.capital);
      const exposureWei = parseEther(formData.exposure);
      const targetReturnBps = Math.round(parseFloat(formData.targetReturn) * 100); // Convert % to basis points
      const stopLossBps = Math.round(parseFloat(formData.stopLoss) * 100);
      const maxSlippageBps = Math.round(parseFloat(formData.maxSlippage) * 100);

      // Encrypt all strategy parameters together
      const encrypted = await encryptStrategyData(
        capitalWei,
        exposureWei,
        targetReturnBps,
        stopLossBps,
        maxSlippageBps,
        parseInt(formData.venueCount),
        parseInt(formData.confidence),
        CONTRACT_ADDRESS,
        address
      );

      toast.info('Submitting encrypted strategy to blockchain...');

      // Generate a unique strategy ID
      const strategyId = `0x${Math.random().toString(16).substr(2, 64).padStart(64, '0')}`;

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'createStrategy',
        args: [
          strategyId,                                    // bytes32 strategyId
          parseInt(formData.opportunityType),           // OpportunityType
          parseInt(formData.riskTier),                   // RiskTier
          encrypted.capitalHandle,                       // externalEuint64 encryptedCapital
          encrypted.exposureHandle,                      // externalEuint64 encryptedExposure
          encrypted.targetReturnHandle,                  // externalEuint32 encryptedTargetReturn
          encrypted.stopLossHandle,                      // externalEuint32 encryptedStopLoss
          encrypted.maxSlippageHandle,                   // externalEuint16 encryptedMaxSlippage
          encrypted.venueCountHandle,                    // externalEuint8 encryptedVenueCount
          encrypted.confidenceHandle,                    // externalEuint8 encryptedConfidence
          encrypted.signature,                           // bytes calldata inputProof
        ],
      });
    } catch (error) {
      console.error('Error creating strategy:', error);
      toast.error('Failed to create strategy: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Strategy created successfully! Your parameters are encrypted on-chain.');
      // Reset form
      setFormData({
        capital: '',
        exposure: '',
        targetReturn: '',
        stopLoss: '',
        maxSlippage: '',
        venueCount: '3',
        confidence: '75',
        opportunityType: '0',
        riskTier: '1',
      });
    }
  }, [isSuccess]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Strategy</CardTitle>
        <CardDescription>
          All parameters are encrypted with Zama FHE - your strategy remains completely private on-chain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capital">Capital (ETH) 🔒</Label>
              <Input
                id="capital"
                type="number"
                step="0.001"
                placeholder="0.1"
                value={formData.capital}
                onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Encrypted on-chain</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exposure">Max Exposure (ETH) 🔒</Label>
              <Input
                id="exposure"
                type="number"
                step="0.001"
                placeholder="0.05"
                value={formData.exposure}
                onChange={(e) => setFormData({ ...formData, exposure: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Encrypted on-chain</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetReturn">Target Return (%) 🔒</Label>
              <Input
                id="targetReturn"
                type="number"
                step="0.1"
                placeholder="5.0"
                value={formData.targetReturn}
                onChange={(e) => setFormData({ ...formData, targetReturn: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Encrypted on-chain</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss (%) 🔒</Label>
              <Input
                id="stopLoss"
                type="number"
                step="0.1"
                placeholder="2.0"
                value={formData.stopLoss}
                onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Encrypted on-chain</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSlippage">Max Slippage (%) 🔒</Label>
              <Input
                id="maxSlippage"
                type="number"
                step="0.01"
                placeholder="0.5"
                value={formData.maxSlippage}
                onChange={(e) => setFormData({ ...formData, maxSlippage: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Encrypted on-chain</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venueCount">Number of Venues 🔒</Label>
              <Input
                id="venueCount"
                type="number"
                min="2"
                max="10"
                value={formData.venueCount}
                onChange={(e) => setFormData({ ...formData, venueCount: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Encrypted on-chain</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence">Confidence Score (0-100) 🔒</Label>
              <Input
                id="confidence"
                type="number"
                min="0"
                max="100"
                value={formData.confidence}
                onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Encrypted on-chain</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opportunityType">Opportunity Type</Label>
              <Select value={formData.opportunityType} onValueChange={(value) => setFormData({ ...formData, opportunityType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Spatial (Cross-Exchange)</SelectItem>
                  <SelectItem value="1">Temporal (Time-Based)</SelectItem>
                  <SelectItem value="2">Statistical</SelectItem>
                  <SelectItem value="3">Triangular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskTier">Risk Tier</Label>
              <Select value={formData.riskTier} onValueChange={(value) => setFormData({ ...formData, riskTier: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Conservative</SelectItem>
                  <SelectItem value="1">Moderate</SelectItem>
                  <SelectItem value="2">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!fheInitialized || isPending || isConfirming}>
            {isPending || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isPending ? 'Encrypting & Submitting...' : 'Confirming Transaction...'}
              </>
            ) : !fheInitialized ? (
              'Initializing Encryption...'
            ) : (
              '🔒 Create Encrypted Strategy'
            )}
          </Button>

          {!fheInitialized && (
            <p className="text-xs text-center text-muted-foreground">
              Initializing Zama FHE encryption system...
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateStrategyForm;
