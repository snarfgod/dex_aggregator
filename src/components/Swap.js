import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';

const Swap = () => {
  // Import the aggregator contract from the Redux state
  const aggregator = useSelector((state) => state.aggregator.contract);  
  const bestRate = useSelector((state) => state.aggregator.bestRate);

  return (
    <div>
      <p>Best Rate: {bestRate}</p>
    </div>
  );
};

export default Swap;
