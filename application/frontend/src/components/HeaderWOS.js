import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
//import ResultPage from '../ResultPage.js';

const HeaderWOS = () => {
  const [loggedIn, setLI] = React.useState(false);

  React.useEffect(() => {
    console.log(document.cookie.length);
    if (document.cookie.length > 20) setLI(true);
  }, []);

  return (
    <Navbar className="topbar fixed-top" expand="lg">
      <Navbar.Brand href="#home">
        <Link to={'/'} style={{ fontSize: '30px', color: 'white' }}>
          SFStateEats
        </Link>
      </Navbar.Brand>
      <Navbar.Toggle className="navbar-dark" aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        {loggedIn === false && (
          <Nav className="ml-auto">
            <Nav.Link href="/signin">
              <Button variant="outline-light">Log in</Button>
            </Nav.Link>
            <Nav.Link href="/signup">
              <Button variant="outline-warning">Sign up</Button>
            </Nav.Link>
          </Nav>
        )}
        {loggedIn === true && (
          <Nav className="ml-auto">
            <Nav.Link href="/signin">
              <Button variant="outline-light">Manage Account</Button>
            </Nav.Link>
            <Nav.Link href="/beginChangePassword">
              <Button variant="outline-light">Change Password</Button>
            </Nav.Link>
            <Nav.Link onClick={() => (document.cookie = 'Token=')} href="/">
              <Button variant="outline-light">Log out</Button>
            </Nav.Link>
          </Nav>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

{
  /*const Footer = () => {
  return (
  <div className="topbar shadow-sm fixed-bottom container-fluid">
            <Row>
              <div className='col-md-3' style={{ color: 'white', marginLeft: '50px' }}>
              <h4>Quick Links</h4>
              <p style={{align: 'left'}} ><Link>All Restaurants</Link><br></br>
              <Link>All Events</Link><br></br>
              <Link>Food Truck Schedule</Link><br></br>
              <Link>Farmer's Market Schedule</Link></p>
              </div>
            
    
              <div className='col-md-3' style={{ color: 'white', marginLeft: '50px' }}>
              <h4>Contact Us</h4>
              <p style={{align: 'left'}} ><Link>Business Owners</Link><br></br>
              <Link>Customers</Link><br></br>
              <Link>Become a Admin</Link><br></br>
              </p>
              </div>
              <div className='col-md-3' style={{ marginLeft: '50px' }}>
              <img className='FooterLogo' src={SFstateLogo}></img>
              </div>
            </Row>
          </div>
  );};*/
}

/*const HeaderWS = () => {
  return (
    <div className="topbar shadow-sm fixed-top container-fluid">
        <div className="col-md-3">
        <Link to={"/"} 
              style={{ fontSize: '30px', color: 'white', marginLeft: '50px' }}
              className="float-left">
               SFStateEats
               </Link>
        </div>

        <div className="col-md-6 mx-auto">
          <Row>
            <form className="col-md-7">
              <input
                type="text"
                placeholder="Explore food places"
                className="bar"
                onChange={e => setKey(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') 
                  {e.preventDefault();
                     search();
                  }}}
              />
            </form>
            <Button className="fa fa-search fa-fw btn-lg col-md-2 mx-3" variant="warning" 
             onClick={search}></Button>
           
          </Row>
        </div>

        <div style={{ position: 'absolute', right: '30px', top: '10px' }}>
        <Link to={"/signin"}> 
          <Button variant="outline-light">Log in</Button>
          </Link>
          <Link to={"/signup"}> 
          <Button style={{ marginLeft: '10px' }} variant="outline-warning">
            Sign up
          </Button>
          </Link>
        </div>
      </div>
  );
};*/

export default HeaderWOS;
