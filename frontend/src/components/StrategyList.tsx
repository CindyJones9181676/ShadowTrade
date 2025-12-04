import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  StrategySummary,
  PlatformStats,
  StrategyStatus,
  getStatusLabel,
  getOpportunityLabel,
  getRiskTierLabel,
} from '@/hooks/useStrategies';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { toastTxSubmitted, toastTxSuccess, toastTxError } from '@/lib/transaction-toast';
import { toast } from 'sonner';
import { RefreshCw, Play, Pause, CheckCircle, Zap, TrendingUp, Shield, AlertTriangle, Activity, Share2 } from 'lucide-react';
import ShareStrategyDialog from './ShareStrategyDialog';

interface StrategyListProps {
  strategies: StrategySummary[];
  platformStats: PlatformStats | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const getStatusColor = (status: StrategyStatus) => {
  switch (status) {
    case StrategyStatus.Draft:
      return 'bg-gray-500/20 text-gray-500';
    case StrategyStatus.Active:
      return 'bg-green-500/20 text-green-500';
    case StrategyStatus.Paused:
      return 'bg-yellow-500/20 text-yellow-500';
    case StrategyStatus.Completed:
      return 'bg-blue-500/20 text-blue-500';
    case StrategyStatus.Liquidated:
      return 'bg-red-500/20 text-red-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getOpportunityIcon = (type: number) => {
  switch (type) {
    case 0:
      return Zap;
    case 1:
      return TrendingUp;
    case 2:
      return Shield;
    case 3:
      return AlertTriangle;
    default:
      return Activity;
  }
};

const StrategyCard = ({ strategy, onRefresh }: { strategy: StrategySummary; onRefresh: () => void }) => {
  const submittedHashRef = useRef<string | null>(null);
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError, error: receiptError } = useWaitForTransactionReceipt({ hash });

  const Icon = getOpportunityIcon(strategy.opportunityType);

  useEffect(() => {
    if (hash && hash !== submittedHashRef.current) {
      submittedHashRef.current = hash;
      toastTxSubmitted(hash, 'Transaction Submitted');
    }
  }, [hash]);

  useEffect(() => {
    if (isSuccess && hash) {
      toastTxSuccess(hash, 'Strategy Updated Successfully');
      submittedHashRef.current = null;
      onRefresh();
    }
  }, [isSuccess, hash, onRefresh]);

  useEffect(() => {
    if (writeError) {
      toastTxError(undefined, writeError);
      submittedHashRef.current = null;
    }
  }, [writeError]);

  useEffect(() => {
    if (isError && hash) {
      toastTxError(hash, receiptError?.message || 'Transaction failed');
      submittedHashRef.current = null;
    }
  }, [isError, hash, receiptError]);

  const handleActivate = () => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'activateStrategy',
      args: [strategy.strategyId],
    });
  };

  const handlePause = () => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'pauseStrategy',
      args: [strategy.strategyId],
    });
  };

  const handleResume = () => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'resumeStrategy',
      args: [strategy.strategyId],
    });
  };

  const handleComplete = () => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'completeStrategy',
      args: [strategy.strategyId],
    });
  };

  const isActionPending = isPending || isConfirming;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{getOpportunityLabel(strategy.opportunityType)}</h3>
              <Badge className={getStatusColor(strategy.status)}>
                {getStatusLabel(strategy.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Risk: {getRiskTierLabel(strategy.riskTier)}
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground space-y-1">
          <div className="font-mono">{strategy.strategyId.slice(0, 10)}...</div>
          <div>Created: {strategy.createdAt ? new Date(strategy.createdAt).toLocaleDateString() : '—'}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Executions</span>
          <div className="font-mono font-medium">{strategy.totalExecutions.toString()}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Successful</span>
          <div className="font-mono font-medium text-green-500">{strategy.successfulExecutions.toString()}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Success Rate</span>
          <div className="font-mono font-medium">
            {strategy.totalExecutions > 0n
              ? `${((Number(strategy.successfulExecutions) / Number(strategy.totalExecutions)) * 100).toFixed(1)}%`
              : '—'}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 flex-wrap">
        {strategy.status === StrategyStatus.Draft && (
          <Button size="sm" onClick={handleActivate} disabled={isActionPending}>
            <Play className="w-3 h-3 mr-1" />
            Activate
          </Button>
        )}
        {strategy.status === StrategyStatus.Active && (
          <>
            <Button size="sm" variant="outline" onClick={handlePause} disabled={isActionPending}>
              <Pause className="w-3 h-3 mr-1" />
              Pause
            </Button>
            <Button size="sm" variant="outline" onClick={handleComplete} disabled={isActionPending}>
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Button>
          </>
        )}
        {strategy.status === StrategyStatus.Paused && (
          <>
            <Button size="sm" onClick={handleResume} disabled={isActionPending}>
              <Play className="w-3 h-3 mr-1" />
              Resume
            </Button>
            <Button size="sm" variant="outline" onClick={handleComplete} disabled={isActionPending}>
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Button>
          </>
        )}
        {/* Share button - available for all strategies */}
        <ShareStrategyDialog strategyId={strategy.strategyId} onShared={onRefresh} />
      </div>
    </div>
  );
};

const StrategyList = ({ strategies, platformStats, loading, error, onRefresh }: StrategyListProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Strategies</CardTitle>
          <CardDescription>Loading strategies...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Strategies</CardTitle>
          <CardDescription className="text-destructive">Failed to load: {error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Strategies</CardTitle>
            <CardDescription>All your encrypted arbitrage strategies</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {platformStats && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border p-3">
              <span className="text-muted-foreground">Total Strategies</span>
              <div className="font-mono font-bold text-lg">{platformStats.strategyCount.toString()}</div>
            </div>
            <div className="rounded-lg border p-3">
              <span className="text-muted-foreground">Active</span>
              <div className="font-mono font-bold text-lg text-green-500">{platformStats.activeStrategyCount.toString()}</div>
            </div>
            <div className="rounded-lg border p-3">
              <span className="text-muted-foreground">Executions</span>
              <div className="font-mono font-bold text-lg">{platformStats.totalExecutionCount.toString()}</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {strategies.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Strategies Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first encrypted arbitrage strategy to get started.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {strategies.map((strategy) => (
                <StrategyCard key={strategy.strategyId} strategy={strategy} onRefresh={onRefresh} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyList;
