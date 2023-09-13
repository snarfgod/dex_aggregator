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

const Swap = () => {
  //Initiate variables
  const [inputToken, setInputToken] = useState(null)
  const [outputToken, setOutputToken] = useState(null)
  const [inputAmount, setInputAmount] = useState(0)
  const [outputAmount, setOutputAmount] = useState(0)
  const [isBuying, setIsBuying] = useState(false)

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
    "WBTC": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
  };
  const AMMAddressMap = {
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D": "Uniswap",
    "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F": "SushiSwap",
    "0x03f7724180AA6b939894B5Ca4314783B0b36b329": "ShibaSwap"
  }

  // Get the best rate from the aggregator contract with selected tokens and amount if input and output tokens are selected
  useEffect(() => {
    if (inputToken && outputToken) {
      const inputTokenAddress = tokenAddressMap[inputToken]; // Get address from map
      const outputTokenAddress = tokenAddressMap[outputToken]; // Get address from map
      //const amount = ethers.utils.parseUnits(inputAmount.toString(), 18);

      // If the output token is DAI, then we are selling and need to set isBuying to false
      if (outputToken === "DAI") {
        setIsBuying(false);
      } else {
        setIsBuying(true);
      }
      
      // Pass the dispatch function to getBestRate
      getBestRate(dispatch, aggregator, inputTokenAddress, outputTokenAddress, ethers.utils.parseUnits('1', 18), isBuying);
    }
  }, [inputToken, outputToken, inputAmount, isBuying, dispatch, aggregator]);
  

  return (
    <div>
    <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
      {account ? (
        <Form style={{ maxWidth: '450px', margin: '50px auto' }}>

          <Row className='my-3'>
            <div className='d-flex justify-content-between'>
              <Form.Label><strong>You give:</strong></Form.Label>
              <Form.Text muted>
                
              </Form.Text>
            </div>
            <InputGroup>
              <Form.Control
                type="number"
                placeholder="0.0"
                min="0.0"
                step="any"
                //onChange={(e) => inputHandler(e) }
                disabled={!inputToken}
              />
              <DropdownButton
                variant="outline-secondary"
                title={inputToken ? inputToken : "Select Token"}
              >
                <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)} >WETH</Dropdown.Item>
                <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)} >DAI</Dropdown.Item>
                <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)} >WBTC</Dropdown.Item>
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
                disabled
              />
              <DropdownButton
                variant="outline-secondary"
                title={outputToken ? outputToken : "Select Token"}
              >
                <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>WETH</Dropdown.Item>
                <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>DAI</Dropdown.Item>
                <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>WBTC</Dropdown.Item>
              </DropdownButton>
            </InputGroup>
          </Row>

          <Row className='my-3'>
              <Button type='submit'>Swap</Button>
            {inputToken && outputToken ? (
              <Form.Text muted>
              Estimated price: {rate} {outputToken} per {inputToken} on {AMMAddressMap[AMM]}
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
