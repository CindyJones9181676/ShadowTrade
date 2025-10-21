import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchTokenPrices } from '../services/priceService';

interface PriceData {
  symbol: string;
  price: number;
  change: number;
}

const PriceTicker = () => {
  const [prices, setPrices] = useState<PriceData[]>([
    { symbol: 'BTC', price: 0, change: 0 },
    { symbol: 'ETH', price: 0, change: 0 },
    { symbol: 'BNB', price: 0, change: 0 },
    { symbol: 'SOL', price: 0, change: 0 },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  const updatePrices = async () => {
    try {
      const symbols = ['BTC', 'ETH', 'BNB', 'SOL'];
      const tokenPrices = await fetchTokenPrices(symbols);

      setPrices(tokenPrices.map(tp => ({
        symbol: tp.symbol,
        price: tp.price,
        change: tp.change24h,
      })));
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updatePrices();
    const interval = setInterval(() => {
      updatePrices();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-y border-primary/30 bg-card py-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading real-time prices...</div>
          ) : (
            prices.map((asset) => (
              <div key={asset.symbol} className="flex items-center gap-3 min-w-fit">
                <span className="text-sm font-mono font-semibold">{asset.symbol}</span>
                <span className="text-sm font-mono">${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <div className={`flex items-center gap-1 text-xs font-mono ${asset.change >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {asset.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{Math.abs(asset.change).toFixed(2)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceTicker;
