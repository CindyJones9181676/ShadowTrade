const stats = [
  { value: '$2.4B+', label: 'Total Volume Processed' },
  { value: '15+', label: 'Supported Exchanges' },
  { value: '99.9%', label: 'Uptime Guarantee' },
  { value: '< 50ms', label: 'Average Latency' }
];

const Stats = () => {
  return (
    <section className="py-24 px-6 border-b border-primary/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-8 border border-primary/30 bg-card">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-mono">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
