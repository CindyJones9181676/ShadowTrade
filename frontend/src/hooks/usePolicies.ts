import { useCallback, useEffect, useState } from 'react';
import { readContract } from '@wagmi/core';
import { config } from '@/config/rainbowkit';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/config/contract';

export interface PolicySummary {
  id: bigint;
  name: string;
  description: string;
  isActive: boolean;
  creator: string;
  createdAt: number;
}

export interface EncryptedTotals {
  totalPoliciesCipher: string;
  totalBenefitRecordsCipher: string;
}

export const usePolicies = () => {
  const [policies, setPolicies] = useState<PolicySummary[]>([]);
  const [encryptedTotals, setEncryptedTotals] = useState<EncryptedTotals | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rawList = (await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'listPolicies',
      })) as [bigint[], string[], boolean[], string[]];

      const [ids, , , creators] = rawList;

      const details = await Promise.all(
        ids.map((id) =>
          readContract(config, {
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'getPolicyDetails',
            args: [id],
          })
        )
      );

      const mapped: PolicySummary[] = ids.map((id, index) => {
        const detail = details[index] as readonly [string, string, boolean, string, bigint];
        return {
          id,
          name: detail[0],
          description: detail[1],
          isActive: detail[2],
          creator: detail[3],
          createdAt: Number(detail[4]) * 1000,
        };
      });

      const totalsRaw = (await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getEncryptedTotals',
      })) as readonly [string, string];

      setPolicies(mapped);
      setEncryptedTotals({
        totalPoliciesCipher: totalsRaw[0],
        totalBenefitRecordsCipher: totalsRaw[1],
      });
    } catch (err) {
      console.error('[usePolicies] Failed to load policies:', err);
      setPolicies([]);
      setEncryptedTotals(null);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return {
    policies,
    encryptedTotals,
    loading,
    error,
    refetch: fetchPolicies,
  };
};
