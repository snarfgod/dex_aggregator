import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers'

import Alert from './Alert'

import {
  getBestRate
} from '../store/interactions'

const { BigNumber } = require("@ethersproject/bignumber");

const Swap = () => {
  //Initiate variables
  const [inputToken, setInputToken] = useState(null)
  const [outputToken, setOutputToken] = useState(null)
  const [inputAmount, setInputAmount] = useState(0)
  const [outputAmount, setOutputAmount] = useState(0)

  const dispatch = useDispatch()

  // Import the aggregator contract and account from the Redux state
  const aggregator = useSelector((state) => state.aggregator.contract)
  const account = useSelector((state) => state.provider.account)
  const chainId = useSelector((state) => state.provider.network)
  const rate = useSelector((state) => state.aggregator.rate)
  const AMM = useSelector((state) => state.aggregator.AMM)

  // Set the input and output tokens to correct token addresses instead of names
  const tokenAddressMap = {
    "WETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    "MATIC": "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
  };
  const AMMAddressMap = {
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D": "Uniswap",
    "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F": "SushiSwap",
    "0x03f7724180AA6b939894B5Ca4314783B0b36b329": "ShibaSwap"
  }

  // Function to format the output based on the magnitude
  const formatOutput = (number) => {
    const num = parseFloat(number);
    if (num === 0) return '0';
    if (num >= 1) return num.toFixed(2);  // 2 decimal places for numbers >= 1
    if (num < 1e-4) return num.toExponential(2);  // Scientific notation for very small numbers
    return num.toFixed(6);  // Up to 6 decimal places for numbers between 0 and 1
  };

  const executeSwap = async () => {
    if (!AMM || !aggregator || !inputToken || !outputToken || inputAmount <= 0) {
      // Show an alert or some notification to the user
      console.error("Missing required parameters for the swap");
      return;
    }

    const signer = await aggregator.provider.getSigner(account);
    const contract = new ethers.Contract(aggregator.address, aggregator.interface, signer);

    const path = [tokenAddressMap[inputToken], tokenAddressMap[outputToken]];
    const amountIn = ethers.utils.parseUnits(inputAmount.toString(), 18);
    const amountOutMin = ethers.utils.parseUnits(outputAmount.toString(), 18); // Replace with actual minimum output amount
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    try {
      const tx = await contract.swapExactTokensForTokens(amountIn, amountOutMin, path, account, deadline, { gasLimit: 21000 });
      await tx.wait();
      console.log("Swap executed successfully");
    } catch (error) {
      console.error("Error executing swap:", error);
    }
  };

  // Get the best rate from the aggregator contract with selected tokens and amount if input and output tokens are selected
  useEffect(() => {
    if (inputToken && outputToken) {
      const inputTokenAddress = tokenAddressMap[inputToken]; // Get address from map
      const outputTokenAddress = tokenAddressMap[outputToken]; // Get address from map
  
      // Pass the dispatch function to getBestRate
      getBestRate(dispatch, aggregator, inputTokenAddress, outputTokenAddress, ethers.utils.parseUnits('1', 18));
  
      if(inputAmount > 0) {
        const amountInWei = ethers.utils.parseUnits(inputAmount.toString(), 18); // Convert to wei
        const rateInWei = ethers.utils.parseUnits(rate.toString(), 18); // Convert rate to wei

        // Use BigNumber for accurate calculations
        const estimatedOutputInWei = amountInWei.mul(rateInWei).div(ethers.utils.parseUnits('1', 18));
        
        // Convert back to human-readable form
        const scaledDownOutput = ethers.utils.formatUnits(estimatedOutputInWei, 18); // This will divide by 10^18

        setOutputAmount(scaledDownOutput);
      }
    }
  }, [inputToken, outputToken, inputAmount, rate, dispatch, aggregator]);
  
  

  return (
    <div>
    <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
      {account ? (
        <Form style={{ maxWidth: '450px', margin: '50px auto' }}>

          <Row className='my-3'>
            <div className='d-flex justify-content-between'>
              <Form.Label><strong>You give:</strong></Form.Label>
            </div>
            <InputGroup>
              <Form.Control
                type="number"
                placeholder="0.0"
                min="0.0"
                step="any"
                value={inputAmount ? inputAmount : '0'}
                onChange={(e) => setInputAmount(e.target.value)}
                disabled={!inputToken}
              />
              <DropdownButton
                variant="outline-secondary"
                title={inputToken ? inputToken : "Select Token"}
              >
                <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)} >WETH</Dropdown.Item>
                <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)} >DAI</Dropdown.Item>
                <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)} >MATIC</Dropdown.Item>
              </DropdownButton>
            </InputGroup>
          </Row>

          <Row className='my-4'>
            <div className='d-flex justify-content-between'>
              <Form.Label><strong>You receive:</strong></Form.Label>
              <Form.Text muted>
                
              </Form.Text>
            </div>
            <InputGroup>
              <Form.Control
                type="number"
                placeholder="0.0"
                min="0.0"
                value={outputAmount}
                disabled
              />
              <DropdownButton
                variant="outline-secondary"
                title={outputToken ? outputToken : "Select Token"}
              >
                <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>WETH</Dropdown.Item>
                <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>DAI</Dropdown.Item>
                <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>MATIC</Dropdown.Item>
              </DropdownButton>
            </InputGroup>
          </Row>

          <Row className='my-3'>
              <Button type='submit'>Swap</Button>
            {inputToken && outputToken ? (
              <Form.Text muted>
              Estimated price: {formatOutput(rate)} {outputToken} per {inputToken} on {AMMAddressMap[AMM]}
              </Form.Text>
            ) : (
              <Form.Text muted>
                Please select token pair
              </Form.Text>
              )}
            
          </Row>

        </Form>

      ) : (
        <p
          className='d-flex justify-content-center align-items-center'
          style={{ height: '300px' }}
        >
          Please connect wallet.
        </p>
      )}
    </Card>
  </div>
  );
};

export default Swap;
