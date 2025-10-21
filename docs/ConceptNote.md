# CovertArbitrage-Deck 概念

CovertArbitrage-Deck 为跨交易所套利团队提供隐私化策略托管。

## 特征
- 策略参数保存在 `euint32[]`，通过 `FHE.select` 选择执行路径。
- `StrategyRouter` 与多链节点交互，attestation 验证成交回执。
- `Obfuscated Reserves` 模块隐藏仓位规模。

## 后续
- 建立风控模拟器，测试 `FHE.gt` 阈值。
- 引入绩效分享，向投资人暴露加密收益区间。
