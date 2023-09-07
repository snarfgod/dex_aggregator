import { useSelector, useDispatch } from 'react-redux'
import Table from 'react-bootstrap/Table';
import Chart from 'react-apexcharts';
import { ethers } from 'ethers'

import { options, series } from './Charts.config';
import { chartSelector } from '../store/selectors';
import { useEffect } from 'react'

import Loading from './Loading';



const Charts = () => {
  
  return (
    <div>
      Charts
    </div>
  );
}

export default Charts;
