import { Lock, Network, Code, Database, TrendingUp, Users } from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: '策略加密存储',
    description: '使用全同态加密技术，策略参数完全加密存储，确保核心算法绝对安全。'
  },
  {
    icon: Users,
    title: '团队协作管理',
    description: '支持多用户协作，权限分级管理，策略共享与权限控制，团队高效协作。'
  },
  {
    icon: Network,
    title: '策略共享交易',
    description: '优质策略可选择性共享，其他用户可订阅跟单，实现策略价值变现。'
  },
  {
    icon: TrendingUp,
    title: '专业带单服务',
    description: '经验丰富的交易员提供专业带单服务，实时策略执行与风险控制。'
  },
  {
    icon: Code,
    title: '智能策略部署',
    description: '支持自定义策略参数，自动化执行，实时监控策略表现与收益。'
  },
  {
    icon: Database,
    title: '隐私保护技术',
    description: '基于零知识证明的隐私计算，策略逻辑完全保密，数据安全无忧。'
  }
];

const Features = () => {
  return (
    <section className="py-24 px-6 border-b border-primary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            核心功能 <span className="text-primary">特色服务</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            专注于策略加密、团队协作、策略共享与专业带单的核心功能
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
