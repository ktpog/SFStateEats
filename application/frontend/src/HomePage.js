import React from 'react';
import InProgress from './loading.gif';
import './App.css';
import {
  Navbar,
  Nav,
  Container,
  Form,
  Dropdown,
  Row,
  Button,
  Modal,
  Carousel,
} from 'react-bootstrap';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import RestaurantPage from './RestaurantPage';
import ResultPage from './ResultPage';
import Signin from './Signin';
import Signup from './Signup';
import { Redirect, useHistory } from 'react-router-dom';
import sampleImage from './assets/banner.png';
import SFstateLogo from './assets/SFstateLogo.png';
import Footer from './components/Footer';

const HomePage = () => {
  const [redirect, setRedirect] = React.useState(false);
  const [url, setUrl] = React.useState('');

  const [loggedIn, setLI] = React.useState(false);

  let history = useHistory();
  const [temp, setTemp] = React.useState('');

  const redirectHandler = () => {
    var query = temp;
    setUrl('/search/' + query);
    setRedirect(true);
  };

  React.useEffect(() => {
    console.log(process.env.NODE_ENV);
  }, []);

  React.useEffect(() => {
    console.log(document.cookie.length);
    if (document.cookie.length > 20) setLI(true);
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    console.log(document.cookie.length);
    if (document.cookie.length > 20) setLI(true);
  }, []);

  return (
    <div>
      <section>
        {redirect === false && (
          <Container style={{ marginTop: '5vh' }}></Container>
        )}
        {redirect === true && (
          <Redirect
            to={{
              pathname: url,
              state: { searchTerm: temp },
            }}
          ></Redirect>
        )}

        <Navbar className="topbar fixed-top" expand="lg">
          <Navbar.Brand>
            <Link to={'/'} style={{ fontSize: '30px', color: 'white' }}>
              SFStateEats
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle
            className="navbar-dark"
            aria-controls="basic-navbar-nav"
          />
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
                <Nav.Link onClick={() => (document.cookie = 'Token=')} href=".">
                  <Button variant="outline-light">Log out</Button>
                </Nav.Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Navbar>

        <div>
          <Container>
            <Row>
              <div style={{ marginTop: '35px' }} className="mx-auto padding">
                <h1>
                  Explore wonderful food and drinks around you, in a few seconds
                </h1>
              </div>
            </Row>
            <Row className="paddingleft">
              <Form className="col-md-9 col-sm-9 col-xs-9 col-9">
                <input
                  type="text"
                  placeholder="Search for restaurants near your campus"
                  className="bar"
                  value={temp}
                  onChange={e => setTemp(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      redirectHandler();
                    }
                  }}
                />
              </Form>
              <Button
                className="fa fa-search fa-fw btn-lg col-md-1 mx-3 col-sm-1 col-1"
                variant="warning"
                onClick={redirectHandler}
              ></Button>
              <Button
                variant="dark"
                className="fa fa-cutlery"
                onClick={() => {
                  setTemp('');
                  redirectHandler();
                }}
              >
                {' '}
                Browse All
              </Button>
            </Row>
            <Row>
              <div className="padding mx-auto col-md-9">
                <img
                  className="d-block w-100"
                  src={sampleImage}
                  alt="First slide"
                />
              </div>
            </Row>
          </Container>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default HomePage;
