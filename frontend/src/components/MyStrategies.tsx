import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Eye, Play, Pause, Square, RefreshCw } from 'lucide-react';
import { useStrategies } from '@/hooks/useStrategies';
import { toast } from 'sonner';

const MyStrategies = () => {
  const { strategies, loading, error, refetch } = useStrategies();

  const getStatusBadge = (status: number) => {
    const statusMap = {
      0: { label: 'Draft', variant: 'secondary' as const },
      1: { label: 'Active', variant: 'default' as const },
      2: { label: 'Paused', variant: 'destructive' as const },
      3: { label: 'Completed', variant: 'outline' as const },
      4: { label: 'Liquidated', variant: 'destructive' as const },
    };
    
    const { label, variant } = statusMap[status as keyof typeof statusMap] || { label: 'Unknown', variant: 'secondary' as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getOpportunityType = (type: number) => {
    const types = ['Spatial', 'Temporal', 'Statistical', 'Triangular'];
    return types[type] || 'Unknown';
  };

  const getRiskTier = (tier: number) => {
    const tiers = ['Conservative', 'Moderate', 'Aggressive'];
    return tiers[tier] || 'Unknown';
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Strategies</CardTitle>
          <CardDescription>
            View and manage your active arbitrage strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Strategies</CardTitle>
          <CardDescription>
            View and manage your active arbitrage strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Loading strategies...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (strategies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Strategies</CardTitle>
          <CardDescription>
            View and manage your active arbitrage strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No strategies found</p>
            <p className="text-sm mt-2">Create your first strategy to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Strategies</CardTitle>
              <CardDescription>
                View and manage your active arbitrage strategies
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategies.map((strategy) => (
              <Card key={strategy.strategyId} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {getOpportunityType(strategy.opportunityType)} Strategy
                        </h3>
                        {getStatusBadge(strategy.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Risk: {getRiskTier(strategy.riskTier)}</span>
                        <span>Executions: {strategy.totalExecutions}</span>
                        <span>
                          Created: {new Date(strategy.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        ID: {strategy.strategyId.slice(0, 16)}...
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      {strategy.status === 1 && (
                        <Button variant="outline" size="sm">
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {strategy.status === 2 && (
                        <Button variant="outline" size="sm">
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Square className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyStrategies;
