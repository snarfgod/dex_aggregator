import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers'

import Alert from './Alert'

const Withdraw = () => {
  

  return (
    <div>
      <Card>
        <Card.Body>
          <Card.Title>Withdraw</Card.Title>
          </Card.Body>
      </Card>
    </div>
  );
}

export default Withdraw;
