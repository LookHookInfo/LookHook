import { useState, useEffect, useMemo } from 'react';
import {
  useReadContract,
  useActiveAccount,
  useSendTransaction,
  useReadContractData,
} from 'thirdweb/react';
import { getContract, formatUnits, parseEther, prepareContractCall } from 'thirdweb';
import { client } from '@/lib/thirdweb/client';
import { chain } from '@/lib/thirdweb/chain';
import { drubContractAddress, drubContractABI } from '@/utils/drubContractAbi';
import {
  vaultDrubContractAddress,
  vaultDrubContractABI,
} from '@/utils/vaultDrubContractAbi';
import { HASH_ADDRESS, HASH_ABI } from '@/utils/erc20';

const drubContract = getContract({
  client,
  chain,
  address: drubContractAddress,
  abi: drubContractABI,
});

const vaultContract = getContract({
  client,
  chain,
  address: vaultDrubContractAddress,
  abi: vaultDrubContractABI,
});

const hashContract = getContract({
  client,
  chain,
  address: HASH_ADDRESS,
  abi: HASH_ABI,
});

export function useDrubContract() {
  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  const [status, setStatus] = useState('');
  const [buyAmount, setBuyAmount] = useState('');

  // DRUB Contract Reads
  const { data: drubPerHash, refetch: refetchDrubPerHash } = useReadContract({
    contract: drubContract,
    method: 'getDrubPerHash',
    params: [],
  });

  const { data: drubTotalSupply, refetch: refetchDrubTotalSupply } = useReadContract({
    contract: drubContract,
    method: 'totalSupply',
    params: [],
  });

  const { data: drubBalance, refetch: refetchDrubBalance } = useReadContract({
    contract: drubContract,
    method: 'balanceOf',
    params: [account?.address || ''],
    queryOptions: { enabled: !!account?.address },
  });

  // HASH Contract Reads
  const { data: hashBalance, refetch: refetchHashBalance } = useReadContract({
    contract: hashContract,
    method: 'balanceOf',
    params: [account?.address || ''],
    queryOptions: { enabled: !!account?.address },
  });

    const { data: hashAllowance, refetch: refetchHashAllowance } = useReadContract({
        contract: hashContract,
        method: 'allowance',
        params: [account?.address || '', drubContractAddress],
        queryOptions: { enabled: !!account?.address },
    });


  // Vault Contract Reads
  const { data: vaultPrice, refetch: refetchVaultPrice } = useReadContract({
    contract: vaultContract,
    method: 'getPrice',
    params: [],
  });

  const isApproved = useMemo(() => {
    if (!hashAllowance || !buyAmount) return false;
    const buyAmountBigInt = parseEther(buyAmount);
    return hashAllowance >= buyAmountBigInt;
  }, [hashAllowance, buyAmount]);


  const approve = () => {
    if (!account || !buyAmount) {
      setStatus('Please connect your wallet and enter an amount.');
      return;
    }

    const amountToApprove = parseEther(buyAmount);

    const transaction = prepareContractCall({
      contract: hashContract,
      method: 'approve',
      params: [drubContractAddress, amountToApprove],
    });

    setStatus('Approving...');
    sendTransaction(transaction, {
      onSuccess: () => {
        setStatus('Approval successful!');
        refetchHashAllowance();
        setTimeout(() => setStatus(''), 3000);
      },
      onError: (error) => {
        setStatus(`Approval failed: ${error.message}`);
        setTimeout(() => setStatus(''), 5000);
      },
    });
  };

  const buyDrub = () => {
    if (!account || !buyAmount) {
        setStatus('Please connect your wallet and enter an amount.');
        return;
    }

    const amountToBuy = parseEther(buyAmount);

    const transaction = prepareContractCall({
        contract: drubContract,
        method: 'buyDRUB',
        params: [amountToBuy],
    });

    setStatus('Processing purchase...');
    sendTransaction(transaction, {
        onSuccess: () => {
            setStatus('Purchase successful!');
            refetchAll();
            setTimeout(() => setStatus(''), 3000);
        },
        onError: (error) => {
            setStatus(`Purchase failed: ${error.message}`);
            setTimeout(() => setStatus(''), 5000);
        },
    });
  };

  const refetchAll = () => {
    refetchDrubPerHash();
    refetchDrubTotalSupply();
    refetchDrubBalance();
    refetchHashBalance();
    refetchHashAllowance();
    refetchVaultPrice();
  };


  return {
    status,
    setStatus,
    buyAmount,
    setBuyAmount,
    drubPerHash: drubPerHash ? formatUnits(drubPerHash, 18) : '0',
    drubTotalSupply: drubTotalSupply ? formatUnits(drubTotalSupply, 18) : '0',
    drubBalance: drubBalance ? formatUnits(drubBalance, 18) : '0',
    hashBalance: hashBalance ? formatUnits(hashBalance, 18) : '0',
    vaultPrice: vaultPrice ? formatUnits(vaultPrice, 18) : '0',
    isApproved,
    approve,
    buyDrub,
    refetchAll,
  };
}
