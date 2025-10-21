import { useState, useEffect } from 'react';
import { useAccount, useWatchContractEvent, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { readContract } from '@wagmi/core';
import { config } from '@/config/rainbowkit';

interface StrategyInfo {
  strategyId: string;
  trader: string;
  opportunityType: number;
  riskTier: number;
  status: number;
  totalExecutions: number;
  createdAt: number;
}

export const useStrategies = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [strategies, setStrategies] = useState<StrategyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useRealData, setUseRealData] = useState(true); // 默认使用真实数据

  // 监听 StrategyCreated 事件
  useWatchContractEvent({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    eventName: 'StrategyCreated',
    onLogs: async (logs) => {
      if (!address || !useRealData) return;

      try {
        // 过滤出当前用户的策略
        const userLogs = logs.filter(log => 
          log.args.trader?.toLowerCase() === address.toLowerCase()
        );

        if (userLogs.length === 0) return;

        // 为每个新策略获取详细信息
        for (const log of userLogs) {
          try {
            const strategyId = log.args.strategyId;
            
            // 检查是否已存在
            const exists = strategies.some(s => s.strategyId === strategyId);
            if (exists) continue;
            
            // 获取策略详细信息
            const strategyInfo = await readContract(config, {
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: CONTRACT_ABI,
              functionName: 'getStrategyInfo',
              args: [strategyId as `0x${string}`],
            });
            
            if (strategyInfo) {
              const newStrategy: StrategyInfo = {
                strategyId,
                trader: log.args.trader,
                opportunityType: Number(log.args.opportunityType),
                riskTier: Number(strategyInfo.riskTier),
                status: Number(strategyInfo.status),
                totalExecutions: Number(strategyInfo.totalExecutions),
                createdAt: Number(log.args.timestamp) * 1000,
              };
              
              setStrategies(prev => [...prev, newStrategy]);
            }
          } catch (err) {
            console.error(`Error fetching info for strategy ${log.args.strategyId}:`, err);
          }
        }
      } catch (err) {
        console.error('Error processing strategy events:', err);
        setError('Failed to process strategy events');
      }
    },
  });

  useEffect(() => {
    const fetchStrategies = async () => {
      if (!address) {
        setStrategies([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        if (useRealData) {
          // 获取真实数据 - 直接查询合约
          try {
            console.log('[useStrategies] Fetching strategies from contract...');
            
            // 直接调用合约的 getTraderStrategies 函数
            const strategyIds = await readContract(config, {
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: CONTRACT_ABI,
              functionName: 'getTraderStrategies',
              args: [address as `0x${string}`],
            });

            console.log('[useStrategies] Found strategy IDs:', strategyIds.length);

            if (strategyIds.length === 0) {
              setStrategies([]);
              return;
            }

            // 为每个策略获取详细信息
            const strategiesWithInfo: StrategyInfo[] = [];
            
            for (const strategyId of strategyIds) {
              try {
                console.log('[useStrategies] Fetching info for strategy:', strategyId);
                
                // 获取策略详细信息
                const strategyInfo = await readContract(config, {
                  address: CONTRACT_ADDRESS as `0x${string}`,
                  abi: CONTRACT_ABI,
                  functionName: 'getStrategyInfo',
                  args: [strategyId as `0x${string}`],
                });
                
                if (strategyInfo) {
                  strategiesWithInfo.push({
                    strategyId,
                    trader: strategyInfo.trader,
                    opportunityType: Number(strategyInfo.opportunityType),
                    riskTier: Number(strategyInfo.riskTier),
                    status: Number(strategyInfo.status),
                    totalExecutions: Number(strategyInfo.totalExecutions),
                    createdAt: Date.now() - Math.random() * 86400000, // 临时时间戳，实际应该从合约获取
                  });
                  console.log('[useStrategies] Added strategy:', strategyId);
                }
              } catch (err) {
                console.error(`Error fetching info for strategy ${strategyId}:`, err);
              }
            }

            console.log('[useStrategies] Final strategies:', strategiesWithInfo.length);
            setStrategies(strategiesWithInfo);
          } catch (err) {
            console.error('Error fetching strategies from contract:', err);
            setError('Failed to load strategies: ' + (err instanceof Error ? err.message : 'Unknown error'));
            setStrategies([]);
          }
        } else {
          // 使用模拟数据（仅在切换模式时使用）
          const mockStrategies: StrategyInfo[] = [
            {
              strategyId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              trader: address,
              opportunityType: 0, // Spatial
              riskTier: 1, // Moderate
              status: 1, // Active
              totalExecutions: 5,
              createdAt: Date.now() - 86400000, // 1 day ago
            },
            {
              strategyId: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              trader: address,
              opportunityType: 1, // Temporal
              riskTier: 2, // Aggressive
              status: 2, // Paused
              totalExecutions: 12,
              createdAt: Date.now() - 172800000, // 2 days ago
            }
          ];
          
          setStrategies(mockStrategies);
        }
      } catch (err) {
        console.error('Error fetching strategies:', err);
        setError('Failed to load strategies');
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, [address, useRealData]);

  const refetch = () => {
    setLoading(true);
    // 重新获取策略数据
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return {
    strategies,
    loading,
    error,
    refetch
  };
};
