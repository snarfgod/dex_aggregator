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

const Swap = () => {

  let [inputToken, setInputToken] = useState(null)
  let [outputToken, setOutputToken] = useState(null)
  let [inputAmount, setInputAmount] = useState(0)
  let [outputAmount, setOutputAmount] = useState(0)

  //import aggregator contract
  const aggregator = useSelector(state => state.aggregator.contract)
  const bestExchangeIndex = useSelector(state => state.aggregator.bestExchange)
  const bestPrice = useSelector(state => state.aggregator.bestPrice)

  const WETHADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  const DAIADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  const WBTCADDRESS = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'

  const inputHandler = async (e) => {
    if (!inputToken || !outputToken) {
      window.alert('Please select token')
      return
    }

    if (inputToken === outputToken) {
      window.alert('Invalid token pair')
      return
    }

    if(inputToken == 'WETH') {
      inputToken = WETHADDRESS
    } else if (inputToken == 'DAI') {
      inputToken = DAIADDRESS
    } else if (inputToken == 'WBTC') {
      inputToken = WBTCADDRESS
    }
    
    if(outputToken == 'WETH') {
      outputToken = WETHADDRESS
    } else if (outputToken == 'DAI') {
      outputToken = DAIADDRESS
    } else if (outputToken == 'WBTC') {
      outputToken = WBTCADDRESS
    }

    setInputAmount(e.target.value)

    const _inputTokenAmount = ethers.utils.parseUnits(e.target.value, 'ether')
    const [bestPrice, bestExchangeIndex] = await aggregator.calculateBestRate(inputToken, outputToken, inputAmount, true)
    setOutputAmount(bestPrice*inputAmount)
  }

  const outputHandler = async (e) => {
    if (!inputToken || !outputToken) {
      window.alert('Please select token')
      return
    }

    if (inputToken === outputToken) {
      window.alert('Invalid token pair')
      return
    }

    if(inputToken == 'WETH') {
      inputToken = WETHADDRESS
    } else if (inputToken == 'DAI') {
      inputToken = DAIADDRESS
    } else if (inputToken == 'WBTC') {
      inputToken = WBTCADDRESS
    }
    
    if(outputToken == 'WETH') {
      outputToken = WETHADDRESS
    } else if (outputToken == 'DAI') {
      outputToken = DAIADDRESS
    } else if (outputToken == 'WBTC') {
      outputToken = WBTCADDRESS
    }

    setInputAmount(e.target.value)
    const [bestPrice, bestExchangeIndex] = await aggregator.calculateBestRate(inputToken, outputToken, inputAmount, true)//must set isbuying correctly 
    setOutputAmount(bestPrice*inputAmount)
  }

  return (
    <div>
      <Card className="text-center">
        <Card.Body>
          <Form style={{ maxWidth: '450px', margin: '50px auto' }}>
            <Form.Group className="mb-3" controlId="formTokenIn">
              <Form.Label>Token Out</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  placeholder="0.0"
                  aria-label="Token Entering Wallet"
                  aria-describedby="basic-addon2"
                  onChange={(e) => inputHandler(e)}
                  disabled={!outputToken}
                  step='any'
                />
                <DropdownButton
                  as={InputGroup.Append}
                  variant="outline-secondary"
                  title={inputToken ? inputToken : 'Token'}
                  id="input-group-dropdown-2"
                >
                  <Dropdown.Item href="#" onClick={(e) => setInputToken(e.target.innerHTML)}>WETH</Dropdown.Item>
                  <Dropdown.Item href="#" onClick={(e) => setInputToken(e.target.innerHTML)}>DAI</Dropdown.Item>
                  <Dropdown.Item href="#" onClick={(e) => setInputToken(e.target.innerHTML)}>WBTC</Dropdown.Item>
                </DropdownButton>

              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTokenOut" >
              <Form.Label>Token In</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  placeholder="0.0"
                  aria-label="Token Leaving Wallet"
                  aria-describedby="basic-addon2"
                  disabled = {!inputToken}
                  onChange={(e) => outputHandler(e) }
                  step='any'
                />
                <DropdownButton
                  as={InputGroup.Append}
                  variant="outline-secondary"
                  title={outputToken ? outputToken : 'Token'}
                  id="input-group-dropdown-2"
                >
                  <Dropdown.Item href="#" onClick={(e) => setOutputToken(e.target.innerHTML)}>WETH</Dropdown.Item>
                  <Dropdown.Item href="#" onClick={(e) => setOutputToken(e.target.innerHTML)}>DAI</Dropdown.Item>
                  <Dropdown.Item href="#" onClick={(e) => setOutputToken(e.target.innerHTML)}>WBTC</Dropdown.Item>
                </DropdownButton>

              </InputGroup>
            </Form.Group>
            <InputGroup>
              <Row className='my-3 mx-auto'>
                <Button type = "submit" className="d-flex justify-content-center align-items-center">
                  Swap
                </Button>
              </Row>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>                  
    </div>
  );
}

export default Swap;
