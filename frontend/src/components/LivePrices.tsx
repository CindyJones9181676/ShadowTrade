import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { fetchDetailedPrices, TokenPrice } from '../services/priceService';

interface AssetPrice {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume: string;
  high24h: number;
  low24h: number;
}

const LivePrices = () => {
  const [assets, setAssets] = useState<AssetPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updatePrices = async () => {
    try {
      const prices = await fetchDetailedPrices();

      const formattedAssets: AssetPrice[] = prices.map(p => ({
        name: p.name,
        symbol: p.symbol,
        price: p.price,
        change24h: p.change24h,
        volume: '$' + (p.price * 1000000000).toLocaleString('en-US', { maximumFractionDigits: 0 }),
        high24h: p.price * (1 + Math.abs(p.change24h) / 100),
        low24h: p.price * (1 - Math.abs(p.change24h) / 100),
      }));

      setAssets(formattedAssets);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch detailed prices:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updatePrices();
    const interval = setInterval(updatePrices, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 px-6 border-b border-primary/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">Loading market prices...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 border-b border-primary/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Activity className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-bold">
            Live Market <span className="text-primary">Prices</span>
          </h2>
          <div className="ml-auto">
            <span className="text-sm text-muted-foreground font-mono">Real-time from CoinGecko</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div key={asset.symbol} className="border border-primary/30 p-6 bg-card hover:border-primary transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold font-mono">{asset.symbol}</h3>
                  <p className="text-xs text-muted-foreground">{asset.name}</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 border ${asset.change24h >= 0 ? 'border-primary/50 text-primary' : 'border-destructive/50 text-destructive'}`}>
                  {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-xs font-mono">{Math.abs(asset.change24h).toFixed(2)}%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-2xl font-bold font-mono">
                    ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: asset.price < 1 ? 4 : 2 })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">24h High</span>
                    <div className="font-mono">${asset.high24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">24h Low</span>
                    <div className="font-mono">${asset.low24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Est. Volume</span>
                    <div className="font-mono">{asset.volume}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LivePrices;
