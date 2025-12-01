import { Wallet, Lock, Share2, Play, Eye } from 'lucide-react';

const steps = [
  {
    icon: Wallet,
    number: '01',
    title: 'Connect Wallet',
    description: 'Connect your Web3 wallet to the Sepolia testnet. The FHE SDK initializes automatically to enable client-side encryption.'
  },
  {
    icon: Lock,
    number: '02',
    title: 'Create Encrypted Strategy',
    description: 'Configure your arbitrage parameters (capital, exposure, targets, stop-loss). All values are encrypted using Zama\'s Relayer SDK before submission.'
  },
  {
    icon: Share2,
    number: '03',
    title: 'Share with Collaborators',
    description: 'Use FHE.allow() to grant read-only access to specific wallet addresses. Recipients can view your strategy without seeing actual values.'
  },
  {
    icon: Play,
    number: '04',
    title: 'Activate & Execute',
    description: 'Activate your strategy to enable execution. The contract validates parameters using FHE comparisons while keeping data encrypted.'
  },
  {
    icon: Eye,
    number: '05',
    title: 'Monitor Performance',
    description: 'Request async decryption through the Gateway to review performance metrics. Insights are delivered via callback without exposing raw data.'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-6 border-b border-primary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From wallet connection to encrypted strategy execution in five simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="border border-primary/30 p-6 bg-card h-full hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                  <span className="text-4xl font-bold text-primary/20 font-mono">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[2px] bg-primary/30" />
              )}
            </div>
          ))}
        </div>

        {/* FHE Flow Diagram */}
        <div className="mt-16 border border-primary/30 p-8 bg-card">
          <h3 className="text-2xl font-bold mb-6 text-center">FHE Integration Flow</h3>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="px-4 py-2 bg-muted rounded-lg font-mono">User Input</div>
            <span className="text-primary">→</span>
            <div className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg font-mono">Relayer SDK</div>
            <span className="text-primary">→</span>
            <div className="px-4 py-2 bg-muted rounded-lg font-mono">fhEVM Contract</div>
            <span className="text-primary">→</span>
            <div className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg font-mono">FHE Operations</div>
            <span className="text-primary">→</span>
            <div className="px-4 py-2 bg-muted rounded-lg font-mono">Gateway Decrypt</div>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <code className="text-primary">FHE.add()</code> •
            <code className="text-primary ml-2">FHE.ge()</code> •
            <code className="text-primary ml-2">FHE.le()</code> •
            <code className="text-primary ml-2">FHE.and()</code> •
            <code className="text-primary ml-2">FHE.allow()</code>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
