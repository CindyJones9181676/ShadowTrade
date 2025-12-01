import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CreateStrategyForm from '@/components/CreateStrategyForm';
import StrategyList from '@/components/StrategyList';
import SharedStrategyList from '@/components/SharedStrategyList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Activity, TrendingUp, Zap, Users } from 'lucide-react';
import { useStrategies } from '@/hooks/useStrategies';

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { strategies, platformStats, loading, error, refetch } = useStrategies();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h1 className="text-4xl font-bold mb-4">Connect Wallet to Trade</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Once connected, you can create encrypted arbitrage strategies and manage your trading portfolio
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2">Strategy Dashboard</h1>
            <p className="text-muted-foreground">
              Create and manage FHE-encrypted arbitrage strategies on Zama fhEVM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Strategies</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {platformStats?.strategyCount.toString() ?? '—'}
                </div>
                <p className="text-xs text-muted-foreground">Platform-wide</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                <Zap className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-green-500">
                  {platformStats?.activeStrategyCount.toString() ?? '—'}
                </div>
                <p className="text-xs text-muted-foreground">Currently executing</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {platformStats?.totalExecutionCount.toString() ?? '—'}
                </div>
                <p className="text-xs text-muted-foreground">Trade executions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Strategies</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-primary">
                  {strategies.length}
                </div>
                <p className="text-xs text-muted-foreground">Your portfolio</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="strategies" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
              <TabsTrigger value="strategies">My Strategies</TabsTrigger>
              <TabsTrigger value="shared" className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Shared With Me
              </TabsTrigger>
              <TabsTrigger value="create">Create Strategy</TabsTrigger>
            </TabsList>

            <TabsContent value="strategies" className="space-y-6">
              <StrategyList
                strategies={strategies}
                platformStats={platformStats}
                loading={loading}
                error={error}
                onRefresh={refetch}
              />
            </TabsContent>

            <TabsContent value="shared" className="space-y-6">
              <SharedStrategyList />
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <CreateStrategyForm onCreated={refetch} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
