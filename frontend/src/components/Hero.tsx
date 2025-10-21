import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-block mb-4">
          <div className="flex items-center gap-2 px-4 py-2 border border-primary bg-card">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-mono">PRIVACY-FIRST PROTOCOL</span>
          </div>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
          <span className="text-foreground">Secure Cross-Exchange</span>
          <br />
          <span className="text-primary">Arbitrage Strategies</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Enterprise-grade privacy infrastructure for professional arbitrage teams. 
          Deploy, manage, and execute strategies across multiple exchanges with zero-knowledge proofs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <ConnectButton />
          <Button variant="outline" size="lg" className="gap-2">
            View Documentation
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
