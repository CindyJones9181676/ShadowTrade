import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  StrategySummary,
  StrategyStatus,
  getStatusLabel,
  getOpportunityLabel,
  getRiskTierLabel,
  useSharedStrategies,
} from '@/hooks/useStrategies';
import { RefreshCw, Zap, TrendingUp, Shield, AlertTriangle, Activity, Users, User } from 'lucide-react';

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

const SharedStrategyCard = ({ strategy }: { strategy: StrategySummary }) => {
  const Icon = getOpportunityIcon(strategy.opportunityType);

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

      {/* Owner info */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
        <User className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Owner:</span>
        <Badge variant="outline" className="font-mono text-xs">
          {strategy.trader.slice(0, 6)}...{strategy.trader.slice(-4)}
        </Badge>
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

      <div className="text-xs text-muted-foreground pt-2 border-t">
        Read-only access - You can view but not modify this strategy
      </div>
    </div>
  );
};

const SharedStrategyList = () => {
  const { sharedStrategies, loading, error, refetch } = useSharedStrategies();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Shared With Me
          </CardTitle>
          <CardDescription>Loading shared strategies...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Shared With Me
          </CardTitle>
          <CardDescription className="text-destructive">Failed to load: {error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={refetch}>
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
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Shared With Me
            </CardTitle>
            <CardDescription>Strategies other users have shared with you</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {sharedStrategies.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Shared Strategies</h3>
            <p className="text-sm text-muted-foreground mb-4">
              When other users share their strategies with you, they will appear here.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {sharedStrategies.map((strategy) => (
                <SharedStrategyCard key={strategy.strategyId} strategy={strategy} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SharedStrategyList;
