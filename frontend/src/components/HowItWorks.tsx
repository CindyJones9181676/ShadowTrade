import { Wallet, Upload, Play, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: Wallet,
    number: '01',
    title: '连接钱包',
    description: '连接Web3钱包，安全认证并访问ShadowTrade平台功能。'
  },
  {
    icon: Upload,
    number: '02',
    title: '加密策略',
    description: '创建套利策略，使用全同态加密技术保护策略参数，确保核心算法安全。'
  },
  {
    icon: Play,
    number: '03',
    title: '团队协作',
    description: '邀请团队成员，设置权限等级，共享策略或订阅优质策略跟单。'
  },
  {
    icon: BarChart3,
    number: '04',
    title: '专业带单',
    description: '选择专业带单服务，实时监控策略表现，获得专业交易员指导。'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-6 border-b border-primary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            使用 <span className="text-primary">流程</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            简单四步，开启你的加密策略交易之旅
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
