import { Lock, Network, Code, Database, TrendingUp, Users } from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'Strategy Encryption',
    description: 'Fully homomorphic encryption protects your strategy parameters, ensuring core algorithms remain absolutely secure.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Multi-user collaboration with role-based permissions, strategy sharing, and granular access controls for efficient teamwork.'
  },
  {
    icon: Network,
    title: 'Strategy Sharing',
    description: 'Premium strategies can be selectively shared, allowing other users to subscribe and follow, enabling strategy monetization.'
  },
  {
    icon: TrendingUp,
    title: 'Professional Trading Services',
    description: 'Experienced traders provide professional trading services with real-time strategy execution and risk management.'
  },
  {
    icon: Code,
    title: 'Smart Strategy Deployment',
    description: 'Custom strategy parameters with automated execution, real-time monitoring of strategy performance and returns.'
  },
  {
    icon: Database,
    title: 'Privacy Protection Technology',
    description: 'Zero-knowledge proof-based privacy computing ensures complete confidentiality of strategy logic and data security.'
  }
];

const Features = () => {
  return (
    <section className="py-24 px-6 border-b border-primary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Core <span className="text-primary">Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Focused on strategy encryption, team collaboration, strategy sharing, and professional trading services
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
