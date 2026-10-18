import { useMemo, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { encodeFunctionData, formatUnits } from 'viem';
import type { ContractFunctionParameters } from 'viem';
import { earlyLoanContract, earlyBirdContract, hashcoinContract } from '../utils/contracts';
import { earlyLoanAbi } from '../utils/earlyLoanAbi';
import { earlyBirdAbi } from '../utils/earlyBirdAbi';
import erc20Abi from '../utils/erc20';
import { earlyPublicClient } from '../lib/viem/client';

// Константы контракта — захардкожены, чтобы не тратить RPC на их чтение.
// Early NFT имеет id 1..221 (token 0 не существует), поэтому сканируем 1..MAX.
const MAX_NFT_SUPPLY = 221;
const ALL_IDS = Array.from({ length: MAX_NFT_SUPPLY }, (_, i) => BigInt(i + 1));

export const LOAN_PER_NFT = 150_000n * 10n ** 18n;
export const REPAY_TOTAL = 151_000n * 10n ** 18n;

export type EarlyLoanStep =
  | 'connect'
  | 'loading'
  | 'borrow'
  | 'repay'
  | 'no-nft'
  | 'empty-pool'
  | 'no-slots';

type LoanKind = 'borrow' | 'repay';

interface EarlyLoanState {
  balance: bigint;
  hasActiveLoan: boolean;
  poolAvailable: bigint;
  slotsLeft: bigint;
  totalActiveLoans: bigint;
  tokenId: bigint | null;
  nftApproved: boolean;
  hashAllowance: bigint;
}

const formatHash = (value?: bigint) =>
  value === undefined ? '0' : Number(formatUnits(value, 18)).toLocaleString('en-US', { maximumFractionDigits: 0 });

type McEntry = { status: 'success' | 'failure'; result?: unknown };
const mcValue = <T,>(r: McEntry | undefined, fallback: T): T =>
  r && r.status === 'success' ? (r.result as T) : fallback;

const mc = (contracts: readonly ContractFunctionParameters[]) => contracts;

async function fetchEarlyLoanState(user: `0x${string}`): Promise<EarlyLoanState> {
  const loanAddress = earlyLoanContract.address as `0x${string}`;
  const nftAddress = earlyBirdContract.address as `0x${string}`;
  const hashAddress = hashcoinContract.address as `0x${string}`;

  // Один multicall вместо 5 отдельных запросов.
  const base = (await earlyPublicClient.multicall({
    contracts: mc([
      { address: nftAddress, abi: earlyBirdAbi, functionName: 'balanceOf', args: [user] },
      { address: loanAddress, abi: earlyLoanAbi, functionName: 'hasActiveLoan', args: [user] },
      { address: loanAddress, abi: earlyLoanAbi, functionName: 'availableLiquidity' },
      { address: loanAddress, abi: earlyLoanAbi, functionName: 'remainingSlots' },
      { address: loanAddress, abi: earlyLoanAbi, functionName: 'totalActiveLoans' },
    ]),
  })) as unknown as McEntry[];

  const balance = mcValue<bigint>(base[0], 0n);
  const hasActiveLoan = mcValue<boolean>(base[1], false);
  const poolAvailable = mcValue<bigint>(base[2], 0n);
  const slotsLeft = mcValue<bigint>(base[3], 0n);
  const totalActiveLoans = mcValue<bigint>(base[4], 0n);

  let tokenId: bigint | null = null;
  let nftApproved = false;
  let hashAllowance = 0n;
  const lowerUser = user.toLowerCase();

  if (hasActiveLoan) {
    // Ищем заложенный токен пользователя одним multicall по mapping loans.
    const loanResults = (await earlyPublicClient.multicall({
      contracts: mc(
        ALL_IDS.map((id) => ({
          address: loanAddress,
          abi: earlyLoanAbi,
          functionName: 'loans',
          args: [id],
        })),
      ),
    })) as unknown as McEntry[];
    for (let i = 0; i < loanResults.length; i++) {
      const r = loanResults[i];
      if (r && r.status === 'success') {
        const [borrower, , active] = r.result as [string, bigint, boolean];
        if (active && borrower.toLowerCase() === lowerUser) {
          tokenId = ALL_IDS[i];
          break;
        }
      }
    }
    if (tokenId !== null) {
      hashAllowance = (await earlyPublicClient.readContract({
        address: hashAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [user, loanAddress],
      })) as bigint;
    }
  } else if (balance > 0n) {
    // Ищем свободный (не заложенный) NFT пользователя одним multicall по ownerOf.
    const owners = (await earlyPublicClient.multicall({
      contracts: mc(
        ALL_IDS.map((id) => ({
          address: nftAddress,
          abi: earlyBirdAbi,
          functionName: 'ownerOf',
          args: [id],
        })),
      ),
    })) as unknown as McEntry[];
    for (let i = 0; i < owners.length; i++) {
      const r = owners[i];
      if (r && r.status === 'success' && (r.result as string).toLowerCase() === lowerUser) {
        tokenId = ALL_IDS[i];
        break;
      }
    }
    if (tokenId !== null) {
      const appr = (await earlyPublicClient.multicall({
        contracts: mc([
          { address: nftAddress, abi: earlyBirdAbi, functionName: 'getApproved', args: [tokenId] },
          { address: nftAddress, abi: earlyBirdAbi, functionName: 'isApprovedForAll', args: [user, loanAddress] },
        ]),
      })) as unknown as McEntry[];
      const approvedAddr = mcValue<string>(appr[0], '');
      const approvedAll = mcValue<boolean>(appr[1], false);
      nftApproved = approvedAll || approvedAddr.toLowerCase() === loanAddress.toLowerCase();
    }
  }

  return { balance, hasActiveLoan, poolAvailable, slotsLeft, totalActiveLoans, tokenId, nftApproved, hashAllowance };
}

export function useEarlyLoan() {
  const account = useActiveAccount();
  const user = account?.address as `0x${string}` | undefined;
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<'approving' | 'executing' | null>(null);

  const { data: state, isLoading } = useQuery({
    queryKey: ['earlyLoan', user],
    queryFn: () => fetchEarlyLoanState(user as `0x${string}`),
    enabled: !!user,
    staleTime: 45_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: async (kind: LoanKind) => {
      if (!account || !state || state.tokenId === null) throw new Error('Loan is not ready');
      const tokenId = state.tokenId;
      const loanAddress = earlyLoanContract.address as `0x${string}`;

      const sendTx = async (to: `0x${string}`, data: `0x${string}`) => {
        const { transactionHash } = await account.sendTransaction({ to, data, chainId: 8453 });
        return earlyPublicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });
      };

      if (kind === 'borrow') {
        // Шаг 1 (если нужно): апрув NFT контракту кредитования.
        if (!state.nftApproved) {
          setPhase('approving');
          await sendTx(
            earlyBirdContract.address as `0x${string}`,
            encodeFunctionData({ abi: earlyBirdAbi, functionName: 'approve', args: [loanAddress, tokenId] }),
          );
        }
        // Шаг 2: сам займ.
        setPhase('executing');
        await sendTx(loanAddress, encodeFunctionData({ abi: earlyLoanAbi, functionName: 'borrow', args: [tokenId] }));
      } else {
        // Шаг 1 (если нужно): апрув HASH на сумму возврата.
        if (state.hashAllowance < REPAY_TOTAL) {
          setPhase('approving');
          await sendTx(
            hashcoinContract.address as `0x${string}`,
            encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [loanAddress, REPAY_TOTAL] }),
          );
        }
        // Шаг 2: возврат займа и разблокировка NFT.
        setPhase('executing');
        await sendTx(loanAddress, encodeFunctionData({ abi: earlyLoanAbi, functionName: 'repay', args: [tokenId] }));
      }
    },
    onSuccess(_data, kind) {
      // Оптимистично финализируем состояние сразу после tx, чтобы UI не зависел от
      // того, когда RPC-нода отдаст обновлённые данные. Затем — фоновый реконсил.
      const prev = queryClient.getQueryData<EarlyLoanState>(['earlyLoan', user]);
      if (prev) {
        if (kind === 'borrow') {
          queryClient.setQueryData<EarlyLoanState>(['earlyLoan', user], {
            ...prev,
            balance: prev.balance > 0n ? prev.balance - 1n : 0n,
            hasActiveLoan: true,
            nftApproved: false,
            hashAllowance: 0n,
            poolAvailable: prev.poolAvailable > LOAN_PER_NFT ? prev.poolAvailable - LOAN_PER_NFT : 0n,
            slotsLeft: prev.slotsLeft > 0n ? prev.slotsLeft - 1n : 0n,
            totalActiveLoans: prev.totalActiveLoans + 1n,
          });
        } else {
          queryClient.setQueryData<EarlyLoanState>(['earlyLoan', user], {
            ...prev,
            balance: prev.balance + 1n,
            hasActiveLoan: false,
            nftApproved: false,
            hashAllowance: 0n,
            poolAvailable: prev.poolAvailable + REPAY_TOTAL,
            slotsLeft: prev.slotsLeft + 1n,
            totalActiveLoans: prev.totalActiveLoans > 0n ? prev.totalActiveLoans - 1n : 0n,
          });
        }
      }
      // Небольшая задержка перед фоновым реконсилом — даём ноде проиндексировать tx,
      // чтобы рефетч не вернул устаревшее состояние и не откатил оптимистичный апдейт.
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['earlyLoan', user] });
        queryClient.invalidateQueries({ queryKey: ['hashcoin', 'balanceOf'] });
      }, 1500);
    },
    onSettled: () => setPhase(null),
  });

  const step: EarlyLoanStep = useMemo(() => {
    if (!user) return 'connect';
    if (isLoading || !state) return 'loading';
    if (state.hasActiveLoan) {
      // Защита от RPC-лага сразу после borrow: пока токен не найден — держим loading.
      if (state.tokenId === null) return 'loading';
      return 'repay';
    }
    if (state.balance === 0n) return 'no-nft';
    if (state.tokenId === null) return 'no-nft';
    if (state.poolAvailable < LOAN_PER_NFT) return 'empty-pool';
    if (state.slotsLeft === 0n) return 'no-slots';
    return 'borrow';
  }, [user, isLoading, state]);

  const label =
    step === 'borrow'
      ? 'Get 150,000 HASH'
      : step === 'repay'
        ? 'Repay 151,000 · Unlock NFT'
        : step === 'no-nft'
          ? 'No Early NFT found'
          : step === 'empty-pool'
            ? 'Pool is empty'
            : step === 'no-slots'
              ? 'Max supply reached'
              : step === 'connect'
                ? 'Connect Wallet'
                : 'Loading…';

  const actionable = step === 'borrow' || step === 'repay';

  const onAction = () => {
    if (step === 'borrow' || step === 'repay') mutation.mutate(step);
  };

  const pendingLabel = !mutation.isPending
    ? null
    : phase === 'approving'
      ? step === 'repay'
        ? 'Approving HASH…'
        : 'Approving NFT…'
      : step === 'repay'
        ? 'Repaying…'
        : 'Borrowing…';

  return {
    step,
    label,
    onAction,
    isActionable: actionable,
    pendingLabel,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isLoading,
    user,
    poolFormatted: formatHash(state?.poolAvailable),
    slotsLeft: state ? Number(state.slotsLeft) : MAX_NFT_SUPPLY,
    totalActiveLoans: state ? Number(state.totalActiveLoans) : 0,
    maxSupply: MAX_NFT_SUPPLY,
    hasActiveLoan: state?.hasActiveLoan ?? false,
    nftApproved: state?.nftApproved ?? false,
    hashAllowance: state?.hashAllowance ?? 0n,
  };
}
