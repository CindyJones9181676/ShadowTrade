import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Shield, Zap, Lock, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Hero = () => {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
        {/* Tech badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Badge variant="outline" className="px-4 py-2 border-primary/50 bg-primary/5">
            <Shield className="w-3 h-3 mr-2 text-primary" />
            <span className="text-xs font-mono">Zama fhEVM v0.9.1</span>
          </Badge>
          <Badge variant="outline" className="px-4 py-2 border-green-500/50 bg-green-500/5">
            <Lock className="w-3 h-3 mr-2 text-green-500" />
            <span className="text-xs font-mono">FHE Encrypted</span>
          </Badge>
          <Badge variant="outline" className="px-4 py-2 border-blue-500/50 bg-blue-500/5">
            <Share2 className="w-3 h-3 mr-2 text-blue-500" />
            <span className="text-xs font-mono">Strategy Sharing</span>
          </Badge>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
          <span className="text-foreground">Shadow</span>
          <span className="text-primary">Trade</span>
        </h1>

        <p className="text-2xl md:text-3xl text-muted-foreground font-light">
          Privacy-Preserving Arbitrage Strategy Platform
        </p>

        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Create, manage, and share encrypted arbitrage strategies on-chain using
          <span className="text-primary font-medium"> Fully Homomorphic Encryption</span>.
          Your trading parameters remain private while maintaining full on-chain verifiability.
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
          <div className="flex items-center justify-center gap-2 px-4 py-3 border border-primary/20 bg-card/50 rounded-lg">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm">FHE Encryption</span>
          </div>
          <div className="flex items-center justify-center gap-2 px-4 py-3 border border-primary/20 bg-card/50 rounded-lg">
            <Share2 className="w-4 h-4 text-primary" />
            <span className="text-sm">Secure Sharing</span>
          </div>
          <div className="flex items-center justify-center gap-2 px-4 py-3 border border-primary/20 bg-card/50 rounded-lg">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm">On-Chain Execution</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <ConnectButton />
          <a
            href="https://sepolia.etherscan.io/address/0xF3965f511c3b048fBE572d98abCf044837Adbc7B"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="gap-2">
              View Contract
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>

        {/* Contract info */}
        <div className="pt-8">
          <p className="text-xs text-muted-foreground/60 font-mono">
            Contract: 0xF3965f511c3b048fBE572d98abCf044837Adbc7B
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Deployed on Ethereum Sepolia Testnet
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
