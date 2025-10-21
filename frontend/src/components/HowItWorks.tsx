import { Wallet, Upload, Play, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: Wallet,
    number: '01',
    title: 'Connect Wallet',
    description: 'Connect your Web3 wallet to authenticate and access the platform securely.'
  },
  {
    icon: Upload,
    number: '02',
    title: 'Deploy Strategy',
    description: 'Upload your arbitrage strategy and configure exchange connections with encrypted API keys.'
  },
  {
    icon: Play,
    number: '03',
    title: 'Execute Trades',
    description: 'Activate your strategy and let the protocol execute trades automatically across exchanges.'
  },
  {
    icon: BarChart3,
    number: '04',
    title: 'Monitor Performance',
    description: 'Track real-time metrics, analyze results, and optimize your strategy parameters.'
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
            Get started in minutes with our streamlined deployment process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="border border-primary/30 p-8 bg-card h-full">
                <div className="flex items-start justify-between mb-6">
                  <step.icon className="w-8 h-8 text-primary" />
                  <span className="text-5xl font-bold text-primary/20 font-mono">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[2px] bg-primary/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
