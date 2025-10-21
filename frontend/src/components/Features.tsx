import { Lock, Network, Code, Database, TrendingUp, Users } from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'Military-grade encryption ensures your trading strategies and API keys remain secure at all times.'
  },
  {
    icon: Network,
    title: 'Multi-Exchange Support',
    description: 'Seamlessly connect to 15+ major exchanges including Binance, Coinbase, Kraken, and more.'
  },
  {
    icon: Code,
    title: 'Custom Strategy Deployment',
    description: 'Deploy your proprietary algorithms with full control over execution parameters and risk limits.'
  },
  {
    icon: Database,
    title: 'Decentralized Storage',
    description: 'Strategy data stored on-chain with IPFS integration for maximum redundancy and availability.'
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Analytics',
    description: 'Monitor performance metrics, PnL, and execution quality across all your strategies in real-time.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Manage permissions and roles for team members with granular access controls.'
  }
];

const Features = () => {
  return (
    <section className="py-24 px-6 border-b border-primary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for <span className="text-primary">Professional Traders</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to run sophisticated arbitrage operations at scale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="border border-primary/30 p-8 bg-card hover:border-primary transition-colors"
            >
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
