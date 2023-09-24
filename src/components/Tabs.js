import Nav from 'react-bootstrap/Nav';
import { LinkContainer } from 'react-router-bootstrap';

const Tabs = () => {
    return(
        <Nav variant='pills' className='justify-content-center my-4'>
            <LinkContainer to='/'>
                <Nav.Link eventKey='/' className='mx-3'>Swap</Nav.Link>
            </LinkContainer>
            <LinkContainer to='/charts'>
                <Nav.Link eventKey='/deposit' className='mx-3'>Charts</Nav.Link>
            </LinkContainer>
        </Nav>
    );
}

export default Tabs;