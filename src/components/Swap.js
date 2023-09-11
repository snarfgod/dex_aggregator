import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';

const Swap = () => {
  const [bestRate, setBestRate] = useState(null);  // To store the best rate
  const [loading, setLoading] = useState(true);  // To indicate if data is being fetched

  // Import the aggregator contract from the Redux state
  const aggregator = useSelector((state) => state.aggregator.contract);

  useEffect(() => {
    const fetchBestRate = async () => {
      if (aggregator) {
        const tokenA = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        const tokenB = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
        const amount = ethers.utils.parseUnits('1', 'ether');
        const isBuying = false;
  
        try {
          const result = await aggregator.callStatic.calculateBestRate(tokenA, tokenB, amount, isBuying);
          const [bestRate, bestAMM] = result;
          setBestRate(ethers.utils.formatUnits(bestRate.toString(), 'ether'));
          setLoading(false);
        } catch (error) {
          console.error('Error calculating best rate:', error);
          setLoading(false);
        }
      }
    };
  
    fetchBestRate();
  }, [aggregator]);
  

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p>Best Rate: {bestRate}</p>
      )}
    </div>
  );
};

export default Swap;
