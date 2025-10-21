import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CreateStrategyForm from '@/components/CreateStrategyForm';
import MyStrategies from '@/components/MyStrategies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp, Activity } from 'lucide-react';

const Dashboard = () => {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Connect your wallet to create and manage encrypted arbitrage strategies
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Strategy Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your encrypted arbitrage strategies
            </p>
          </div>

          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="strategies">My Strategies</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <CreateStrategyForm />
            </TabsContent>

            <TabsContent value="strategies" className="space-y-6">
              <MyStrategies />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Capital</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Encrypted</div>
                    <p className="text-xs text-muted-foreground">
                      Your capital is FHE encrypted
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      No active strategies
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Encrypted</div>
                    <p className="text-xs text-muted-foreground">
                      Your PnL is FHE encrypted
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
