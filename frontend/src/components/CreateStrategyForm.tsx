import { useEffect, useMemo, useState, useRef } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, toHex } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { encryptStrategyParams, initializeFHE } from '@/lib/fhe';
import { toastTxSubmitted, toastTxSuccess, toastTxError } from '@/lib/transaction-toast';
import { OpportunityType, RiskTier } from '@/hooks/useStrategies';
import { Shield, TrendingUp, AlertTriangle, Zap } from 'lucide-react';

interface CreateStrategyFormProps {
  onCreated?: () => void;
}

const CreateStrategyForm = ({ onCreated }: CreateStrategyFormProps) => {
  const { address } = useAccount();
  const [fheReady, setFheReady] = useState(false);
  const [formData, setFormData] = useState({
    opportunityType: OpportunityType.Spatial,
    riskTier: RiskTier.Moderate,
    capital: '0.1',      // ETH
    exposure: '0.05',    // ETH
    targetReturn: 500,   // 5% (500 bps)
    stopLoss: 1000,      // 10% (1000 bps)
    maxSlippage: 50,     // 0.5% (50 bps)
    venueCount: 3,
    confidence: 75,
  });

  const submittedHashRef = useRef<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!address) return;

    const init = async () => {
      try {
        await initializeFHE();
        setFheReady(true);
      } catch (error) {
        console.error('[FHE] Initialization failed:', error);
        toast.error('Failed to initialize FHE. Please check browser script loading.');
      }
    };

    init();
  }, [address]);

  const canSubmit = useMemo(() => {
    if (!fheReady) return false;
    if (!formData.capital || parseFloat(formData.capital) <= 0) return false;
    if (formData.venueCount < 2) return false;
    if (formData.confidence < 50) return false;
    return true;
  }, [formData, fheReady]);

  const resetForm = () => {
    setFormData({
      opportunityType: OpportunityType.Spatial,
      riskTier: RiskTier.Moderate,
      capital: '0.1',
      exposure: '0.05',
      targetReturn: 500,
      stopLoss: 1000,
      maxSlippage: 50,
      venueCount: 3,
      confidence: 75,
    });
  };

  // Handle transaction submitted
  useEffect(() => {
    if (hash && hash !== submittedHashRef.current) {
      submittedHashRef.current = hash;
      toastTxSubmitted(hash, 'Transaction Submitted');
    }
  }, [hash]);

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash) {
      toastTxSuccess(hash, 'Strategy Created Successfully');
      resetForm();
      submittedHashRef.current = null;
      onCreated?.();
    }
  }, [isSuccess, hash, onCreated]);

  // Handle write contract error
  useEffect(() => {
    if (writeError) {
      toastTxError(undefined, writeError);
      submittedHashRef.current = null;
    }
  }, [writeError]);

  // Handle transaction receipt error
  useEffect(() => {
    if (isReceiptError && hash) {
      const errorMessage = receiptError?.message || 'Transaction execution failed';
      toastTxError(hash, errorMessage);
      submittedHashRef.current = null;
    }
  }, [isReceiptError, hash, receiptError]);

  const generateStrategyId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return keccak256(toHex(`${address}-${timestamp}-${random}`));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!fheReady) {
      toast.error('FHE not initialized');
      return;
    }

    try {
      toast.info('Performing FHE encryption...');

      const capitalWei = BigInt(Math.floor(parseFloat(formData.capital) * 1e18));
      const exposureWei = BigInt(Math.floor(parseFloat(formData.exposure) * 1e18));

      const { handles, proof } = await encryptStrategyParams(
        address,
        {
          capital: capitalWei,
          exposure: exposureWei,
          targetReturnBps: formData.targetReturn,
          stopLossBps: formData.stopLoss,
          maxSlippageBps: formData.maxSlippage,
          venueCount: formData.venueCount,
          confidence: formData.confidence,
        }
      );

      const strategyId = generateStrategyId();

      toast.info('Submitting transaction...');

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'createStrategy',
        args: [
          strategyId,
          formData.opportunityType,
          formData.riskTier,
          handles[0], // capital
          handles[1], // exposure
          handles[2], // targetReturn
          handles[3], // stopLoss
          handles[4], // maxSlippage
          handles[5], // venueCount
          handles[6], // confidence
          proof,
        ],
      });
    } catch (error) {
      console.error('Failed to create strategy:', error);
      toastTxError(undefined, error instanceof Error ? error : 'Failed to create strategy');
    }
  };

  const opportunityTypes = [
    { value: OpportunityType.Spatial, label: 'Spatial Arbitrage', icon: Zap, desc: 'Cross-exchange price differences' },
    { value: OpportunityType.Temporal, label: 'Temporal Arbitrage', icon: TrendingUp, desc: 'Time-based price movements' },
    { value: OpportunityType.Statistical, label: 'Statistical Arbitrage', icon: Shield, desc: 'Statistical price models' },
    { value: OpportunityType.Triangular, label: 'Triangular Arbitrage', icon: AlertTriangle, desc: 'Multi-asset price loops' },
  ];

  const riskTiers = [
    { value: RiskTier.Conservative, label: 'Conservative', color: 'text-green-500' },
    { value: RiskTier.Moderate, label: 'Moderate', color: 'text-yellow-500' },
    { value: RiskTier.Aggressive, label: 'Aggressive', color: 'text-red-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Create Encrypted Strategy
        </CardTitle>
        <CardDescription>
          All strategy parameters are encrypted using FHE before submission
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Opportunity Type */}
          <div className="space-y-3">
            <Label>Opportunity Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {opportunityTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, opportunityType: type.value }))}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      formData.opportunityType === type.value
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{type.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Risk Tier */}
          <div className="space-y-3">
            <Label>Risk Tier</Label>
            <div className="flex gap-3">
              {riskTiers.map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, riskTier: tier.value }))}
                  className={`flex-1 py-3 px-4 rounded-lg border text-center transition-colors ${
                    formData.riskTier === tier.value
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <span className={`font-medium ${tier.color}`}>{tier.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Capital & Exposure */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capital">Capital (ETH)</Label>
              <Input
                id="capital"
                type="number"
                min="0.01"
                max="10"
                step="0.01"
                placeholder="0.1"
                value={formData.capital}
                onChange={(e) => setFormData(prev => ({ ...prev, capital: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Min: 0.01 ETH, Max: 10 ETH</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exposure">Exposure (ETH)</Label>
              <Input
                id="exposure"
                type="number"
                min="0"
                max="10"
                step="0.01"
                placeholder="0.05"
                value={formData.exposure}
                onChange={(e) => setFormData(prev => ({ ...prev, exposure: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Current market exposure</p>
            </div>
          </div>

          {/* Target Return & Stop Loss */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Target Return</Label>
                <span className="text-sm text-muted-foreground">{(formData.targetReturn / 100).toFixed(1)}%</span>
              </div>
              <Slider
                value={[formData.targetReturn]}
                min={100}
                max={5000}
                step={50}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, targetReturn: value }))}
              />
              <p className="text-xs text-muted-foreground">Min: 1%</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Stop Loss</Label>
                <span className="text-sm text-muted-foreground">{(formData.stopLoss / 100).toFixed(1)}%</span>
              </div>
              <Slider
                value={[formData.stopLoss]}
                min={100}
                max={2000}
                step={50}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, stopLoss: value }))}
              />
              <p className="text-xs text-muted-foreground">Max: 20%</p>
            </div>
          </div>

          {/* Max Slippage */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Max Slippage</Label>
              <span className="text-sm text-muted-foreground">{(formData.maxSlippage / 100).toFixed(2)}%</span>
            </div>
            <Slider
              value={[formData.maxSlippage]}
              min={10}
              max={200}
              step={5}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, maxSlippage: value }))}
            />
            <p className="text-xs text-muted-foreground">Max: 2%</p>
          </div>

          {/* Venue Count & Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venueCount">Venue Count</Label>
              <Select
                value={formData.venueCount.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, venueCount: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select venues" />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7, 8].map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} venues
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Min: 2 venues</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Confidence</Label>
                <span className="text-sm text-muted-foreground">{formData.confidence}%</span>
              </div>
              <Slider
                value={[formData.confidence]}
                min={50}
                max={100}
                step={1}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, confidence: value }))}
              />
              <p className="text-xs text-muted-foreground">Min: 50%</p>
            </div>
          </div>

          {/* FHE Status */}
          <div className={`rounded-lg border px-4 py-3 ${fheReady ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${fheReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
              <p className="text-sm font-medium">
                {fheReady ? 'FHE Ready - All parameters will be encrypted' : 'Initializing FHE...'}
              </p>
            </div>
          </div>

          <Button type="submit" disabled={!canSubmit || isPending || isConfirming} className="w-full">
            {isPending ? 'Waiting for wallet...' : isConfirming ? 'Confirming...' : 'Create Encrypted Strategy'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateStrategyForm;
