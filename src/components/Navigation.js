import { useSelector, useDispatch } from 'react-redux';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Blockies from 'react-blockies';

import logo from '../logo.png';
import { Button } from 'react-bootstrap';

import { loadAccount, loadBalances } from '../store/interactions';
import config from '../config.json';

const Navigation = () => {
  const chainId = useSelector(state => state.provider.chainId)
  const account = useSelector(state => state.provider.account);
  const tokens = useSelector(state => state.tokens.contracts);
  const amm = useSelector(state => state.amm.contract);

  const dispatch = useDispatch();

  const connectHandler = async () => {
    try {
      const account = await loadAccount(dispatch)
      await loadBalances(amm, tokens, account, dispatch)
    } catch (error) {
      console.log(error)
    }
  }

  const networkHandler = async (e) => {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: e.target.value }]
    })
  }

  return (
    <Navbar className='my-3' expand='lg'>
      <img
        alt="logo"
        src={logo}
        width="40"
        height="40"
        className="d-inline-block align-top mx-3"
      />
      <Navbar.Brand href="#">SnarfAMM</Navbar.Brand>
      <Navbar.Toggle aria-controls="nav" />
      <Navbar.Collapse id='nav' className="justify-content-end">
        <div className='d-flex justify-content-end mt-3'>

          <Form.Select
            aria-label="Network Selector"
            value={config[chainId] ? `0x${chainId.toString(16)}` : '0'}
            onChange={networkHandler}
            style={{ maxWidth: '200px', marginRight: '20px' }}
          >
            <option value='0'disabled>Select Network</option>
            <option value='0x7A69'>localhost</option>
            <option value='0x5'>Goerli</option>
          </Form.Select>

          {account ? (
            <Navbar.Text className='d-flex align-items-center'>
              {account.slice(0,5) + '...' + account.slice(38,42)}
              <Blockies
                seed={account}
                size={10}
                scale={3}
                className='identicon mx-2 rounded-circle'
                color='#2187e7'
                bgColor='#F1F2F9'
                spotColor='#A7C4DD'
              />
            </Navbar.Text>
            ) : (
            <Button onClick={connectHandler} variant='primary' href='#' className='mx-3'>Connect</Button>
            )
          }
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;
