export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  name: string;
}

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// CoinGecko coin IDs
const COIN_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  USDT: 'tether',
  USDC: 'usd-coin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  MATIC: 'matic-network',
};

export const fetchTokenPrices = async (symbols: string[]): Promise<TokenPrice[]> => {
  try {
    const coinIds = symbols.map(s => COIN_IDS[s as keyof typeof COIN_IDS]).filter(Boolean).join(',');

    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }

    const data = await response.json();

    return symbols.map(symbol => {
      const coinId = COIN_IDS[symbol as keyof typeof COIN_IDS];
      const coinData = data[coinId];

      if (!coinData) {
        return {
          symbol,
          price: 0,
          change24h: 0,
          name: symbol,
        };
      }

      return {
        symbol,
        price: coinData.usd || 0,
        change24h: coinData.usd_24h_change || 0,
        name: symbol,
      };
    });
  } catch (error) {
    console.error('Error fetching token prices:', error);
    // Return fallback data on error
    return symbols.map(symbol => ({
      symbol,
      price: 0,
      change24h: 0,
      name: symbol,
    }));
  }
};

export const fetchDetailedPrices = async (): Promise<TokenPrice[]> => {
  try {
    const coinIds = Object.values(COIN_IDS).slice(0, 6).join(',');

    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch detailed prices');
    }

    const data = await response.json();

    return data.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price || 0,
      change24h: coin.price_change_percentage_24h || 0,
      name: coin.name,
    }));
  } catch (error) {
    console.error('Error fetching detailed prices:', error);
    return [];
  }
};
