import { useCallback, useEffect, useState } from 'react';
import { readContract } from '@wagmi/core';
import { useAccount } from 'wagmi';
import { config } from '@/config/rainbowkit';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/config/contract';

// Enums matching contract
export enum StrategyStatus {
  Draft = 0,
  Active = 1,
  Paused = 2,
  Completed = 3,
  Liquidated = 4,
}

export enum OpportunityType {
  Spatial = 0,
  Temporal = 1,
  Statistical = 2,
  Triangular = 3,
}

export enum RiskTier {
  Conservative = 0,
  Moderate = 1,
  Aggressive = 2,
}

export const getStatusLabel = (status: StrategyStatus): string => {
  const labels = ['Draft', 'Active', 'Paused', 'Completed', 'Liquidated'];
  return labels[status] || 'Unknown';
};

export const getOpportunityLabel = (type: OpportunityType): string => {
  const labels = ['Spatial', 'Temporal', 'Statistical', 'Triangular'];
  return labels[type] || 'Unknown';
};

export const getRiskTierLabel = (tier: RiskTier): string => {
  const labels = ['Conservative', 'Moderate', 'Aggressive'];
  return labels[tier] || 'Unknown';
};

export interface StrategySummary {
  strategyId: `0x${string}`;
  trader: string;
  opportunityType: OpportunityType;
  riskTier: RiskTier;
  status: StrategyStatus;
  totalExecutions: bigint;
  successfulExecutions: bigint;
  createdAt: number;
  activatedAt: number;
  lastExecutionAt: number;
}

export interface PlatformStats {
  strategyCount: bigint;
  activeStrategyCount: bigint;
  totalExecutionCount: bigint;
}

export const useStrategies = () => {
  const { address, isConnected } = useAccount();
  const [strategies, setStrategies] = useState<StrategySummary[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategies = useCallback(async () => {
    if (!isConnected || !address) {
      setStrategies([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get trader's strategy IDs
      const strategyIds = (await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getTraderStrategies',
        args: [address],
      })) as `0x${string}`[];

      // Fetch details for each strategy
      const strategiesData = await Promise.all(
        strategyIds.map(async (strategyId) => {
          const info = (await readContract(config, {
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'getStrategyInfo',
            args: [strategyId],
          })) as readonly [string, number, number, number, bigint, bigint];

          // Also get strategy metadata
          const strategyData = (await readContract(config, {
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'strategies',
            args: [strategyId],
          })) as readonly [
            `0x${string}`, // strategyId
            string,        // trader
            number,        // opportunityType
            number,        // riskTier
            number,        // status
            bigint,        // capitalCipher
            bigint,        // exposureCipher
            bigint,        // realizedPnLCipher
            bigint,        // totalFeeCipher
            bigint,        // targetReturnBpsCipher
            bigint,        // stopLossBpsCipher
            bigint,        // maxSlippageBpsCipher
            bigint,        // venueCountCipher
            bigint,        // confidenceCipher
            bigint,        // createdAt
            bigint,        // activatedAt
            bigint,        // lastExecutionAt
            bigint,        // totalExecutions
            bigint,        // successfulExecutions
          ];

          return {
            strategyId,
            trader: info[0],
            opportunityType: info[1] as OpportunityType,
            riskTier: info[2] as RiskTier,
            status: info[3] as StrategyStatus,
            totalExecutions: info[4],
            successfulExecutions: info[5],
            createdAt: Number(strategyData[14]) * 1000,
            activatedAt: Number(strategyData[15]) * 1000,
            lastExecutionAt: Number(strategyData[16]) * 1000,
          };
        })
      );

      setStrategies(strategiesData);

      // Fetch platform stats
      const [strategyCount, activeStrategyCount, totalExecutionCount] = await Promise.all([
        readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'strategyCount',
        }) as Promise<bigint>,
        readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'activeStrategyCount',
        }) as Promise<bigint>,
        readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'totalExecutionCount',
        }) as Promise<bigint>,
      ]);

      setPlatformStats({
        strategyCount,
        activeStrategyCount,
        totalExecutionCount,
      });
    } catch (err) {
      console.error('[useStrategies] Failed to load strategies:', err);
      setStrategies([]);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  return {
    strategies,
    platformStats,
    loading,
    error,
    refetch: fetchStrategies,
  };
};

// Hook for fetching strategies shared with the current user
export const useSharedStrategies = () => {
  const { address, isConnected } = useAccount();
  const [sharedStrategies, setSharedStrategies] = useState<StrategySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSharedStrategies = useCallback(async () => {
    if (!isConnected || !address) {
      setSharedStrategies([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get strategy IDs shared with the user
      const sharedIds = (await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getStrategiesSharedWithMe',
        args: [],
        account: address,
      })) as `0x${string}`[];

      if (sharedIds.length === 0) {
        setSharedStrategies([]);
        setLoading(false);
        return;
      }

      // Fetch details for each shared strategy
      const strategiesData = await Promise.all(
        sharedIds.map(async (strategyId) => {
          try {
            const info = (await readContract(config, {
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: CONTRACT_ABI,
              functionName: 'getSharedStrategyInfo',
              args: [strategyId],
              account: address,
            })) as readonly [string, number, number, number, bigint, bigint, bigint];

            return {
              strategyId,
              trader: info[0],
              opportunityType: info[1] as OpportunityType,
              riskTier: info[2] as RiskTier,
              status: info[3] as StrategyStatus,
              totalExecutions: info[4],
              successfulExecutions: info[5],
              createdAt: Number(info[6]) * 1000,
              activatedAt: 0,
              lastExecutionAt: 0,
            };
          } catch (err) {
            console.error(`[useSharedStrategies] Failed to load strategy ${strategyId}:`, err);
            return null;
          }
        })
      );

      setSharedStrategies(strategiesData.filter((s): s is StrategySummary => s !== null));
    } catch (err) {
      console.error('[useSharedStrategies] Failed to load shared strategies:', err);
      setSharedStrategies([]);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    fetchSharedStrategies();
  }, [fetchSharedStrategies]);

  return {
    sharedStrategies,
    loading,
    error,
    refetch: fetchSharedStrategies,
  };
};
