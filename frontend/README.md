# CrypticBenefit Network Frontend

React/Vite 单页应用，用于连接 `CrypticBenefitNetworkV2` 合约，实现以下 FHE 流程：

- 任意地址创建福利政策（支持明文额度或 FHE 加密额度）
- 针对已发布政策提交福利记录（明文或 FHE 加密金额）
- 浏览链上政策列表，并查看加密统计（政策总数、福利记录总数密文）

浏览器侧通过 Zama fhEVM SDK (`@zama-fhe/relayer-sdk` UMD 包) 完成密文生成，再与合约进行交互。

---

## 环境要求

- Node.js 18+
- npm 9+（或同等包管理器）
- 已部署的 `CrypticBenefitNetworkV2` 合约地址

### 环境变量

在 `frontend/.env` 中设置：

```
VITE_CBN_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

> 未设置时将回退到 `0x0000000000000000000000000000000000000000`，前端会提示找不到合约。

---

## 本地开发流程

```
cd CovertArbitrage-Deck/frontend

# 安装依赖
npm install

# 启动本地开发（Vite）
npm run dev

# 构建生产包（输出到 dist/）
npm run build
```

---

## FHE 集成要点

- `src/lib/fhe.ts` 在浏览器端懒加载 `https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js`。
- 加载完成后调用 `window.relayerSDK.initSDK()` 与 `createInstance` 创建 fhEVM 实例。
- `encryptPolicyLimit` / `encryptBenefitAmount`：
  1. `fhe.createEncryptedInput(contractAddress, userAddress)`
  2. `ciphertext.add64(value)`
  3. `ciphertext.encrypt()` -> 返回 `handle` 与 `proof`
- 表单根据「启用 FHE 加密」开关，决定调用加密版函数或明文版合约方法。

若浏览器阻止外部脚本（CSP、广告拦截等），FHE 初始化会失败，需要手动允许加载。

---

## 功能模块

### 创建福利政策
- 路径：`src/components/CreatePolicyForm.tsx`
- 提供政策名称、描述、最大额度输入
- 可切换 FHE 加密，调用 `createPolicy` 或 `createPolicyEncrypted`

### 提交福利记录
- 路径：`src/components/RecordBenefitForm.tsx`
- 从链上政策列表中选择政策，填写福利金额
- 可切换 FHE，加密后调用 `recordEncryptedBenefit`

### 政策列表与加密统计
- 路径：`src/components/PolicyList.tsx`
- 使用 `usePolicies` Hook 获取 `listPolicies` 与 `getEncryptedTotals`
- 展示政策详情、状态、创建者及加密统计密文

---

## 关键目录

| 路径 | 说明 |
| ---- | ---- |
| `src/lib/fhe.ts` | FHE SDK 初始化与加密工具函数 |
| `src/hooks/usePolicies.ts` | 读取链上政策与密文统计的自定义 Hook |
| `src/pages/Dashboard.tsx` | 主控制面板（创建政策/提交福利/列表展示） |
| `src/config/contract.ts` | 合约地址与 ABI 配置（从 Hardhat artifacts 同步） |

---

## 调试提示

- `FHE SDK not available`：检查外部脚本是否被浏览器阻止。
- `Invalid proof`：确认证书钱包地址与合约 `FHE.allowThis` 权限逻辑匹配，且输入顺序正确。
- 推荐使用 Sepolia 网络，并确保前端环境变量与链上部署地址一致。

---

## 参考项目

- `CrypticBenefit-Network`：Solidity 合约、部署脚本及 FHE 数据流实现。
- `CovertArbitrage-Deck` / `ConcealedPayroll-Engine`：其他成功的 FHE 集成前端，可参考其参数加密与调用模式。
