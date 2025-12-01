import { Lock, Network, Code, Database, TrendingUp, Users, Share2, Shield, Key, Eye } from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'FHE Strategy Encryption',
    description: 'All strategy parameters (capital, exposure, targets, stop-loss) are encrypted using Zama fhEVM. Your trading logic remains private while stored on-chain.',
    tech: 'euint64, euint32, euint16, euint8'
  },
  {
    icon: Share2,
    title: 'Secure Strategy Sharing',
    description: 'Share encrypted strategies with specific wallet addresses using FHE.allow(). Recipients get read-only access without exposing actual values.',
    tech: 'FHE Access Control'
  },
  {
    icon: Shield,
    title: 'On-Chain Privacy',
    description: 'All computations execute on encrypted data directly on-chain. No off-chain components needed - fully decentralized and verifiable.',
    tech: 'Zero-Knowledge Execution'
  },
  {
    icon: Key,
    title: 'Granular Access Control',
    description: 'Grant and revoke access at any time. Strategy owners maintain full control over who can view their encrypted trading parameters.',
    tech: 'Revocable Permissions'
  },
  {
    icon: TrendingUp,
    title: 'Multi-Strategy Portfolio',
    description: 'Support for Spatial, Temporal, Statistical, and Triangular arbitrage strategies with Conservative, Moderate, and Aggressive risk tiers.',
    tech: '4 Strategy Types'
  },
  {
    icon: Eye,
    title: 'Async Decryption',
    description: 'Request performance reviews through Gateway-based async decryption. Get insights while maintaining privacy of underlying data.',
    tech: 'Gateway Callbacks'
  }
];

const Features = () => {
  return (
    <section className="py-24 px-6 border-b border-primary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powered by <span className="text-primary">FHE Technology</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Zama's Fully Homomorphic Encryption enables encrypted computations directly on-chain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="border border-primary/30 p-8 bg-card hover:border-primary transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <feature.icon className="w-10 h-10 text-primary" />
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  {feature.tech}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* FHE Data Types */}
        <div className="mt-16 border border-primary/30 p-8 bg-card">
          <h3 className="text-2xl font-bold mb-6 text-center">Encrypted Data Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-muted rounded-lg">
              <code className="text-primary font-mono text-lg">euint64</code>
              <p className="text-sm text-muted-foreground mt-2">Capital, Exposure, PnL</p>
            </div>
            <div className="text-center p-4 border border-muted rounded-lg">
              <code className="text-primary font-mono text-lg">euint32</code>
              <p className="text-sm text-muted-foreground mt-2">Target Return, Stop Loss</p>
            </div>
            <div className="text-center p-4 border border-muted rounded-lg">
              <code className="text-primary font-mono text-lg">euint16</code>
              <p className="text-sm text-muted-foreground mt-2">Max Slippage (bps)</p>
            </div>
            <div className="text-center p-4 border border-muted rounded-lg">
              <code className="text-primary font-mono text-lg">euint8</code>
              <p className="text-sm text-muted-foreground mt-2">Venue Count, Confidence</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
