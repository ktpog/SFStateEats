import React, { useState, useEffect } from 'react';
import InProgress from './loading.gif';
import './App.css';
import {
  Carousel,
  Container,
  Navbar,
  Nav,
  Form,
  FormControl,
  Dropdown,
  Row,
  Button,
  Card,
} from 'react-bootstrap';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import { Redirect, useHistory } from 'react-router-dom';
import ReviewContainer from './ReviewContainer';
import ProfileSlider from './ProfileSlider';
import Footer from './components/Footer';

const RestaurantPage = ({ match, location }) => {
  const [redirect, setRedirect] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [temp, setTemp] = React.useState('');
  const [loggedIn, setLI] = React.useState(false);
  const [restaurantData, setRestaurantData] = React.useState({});

  let history = useHistory();

  // Fetch image for this restaurant
  useEffect(() => {
    axios
      .get(`${window.CSC675_ENDPOINT_URL}/api/restaurant/${match.params.id}`, {withCredentials: true})
      .then(res => {
        setRestaurantData(res.data.Restaurant[0]);
      })
      .catch(e => console.log(e));
  }, []);

  var query = '';

  console.log(restaurantData.business_account_id);

  const redirectHandler = () => {
    query = temp;
    setUrl('/search/' + query);
    setRedirect(true);
  };

  React.useEffect(() => {
    console.log(document.cookie.length);
    if (document.cookie.length > 20) setLI(true);
  }, []);

  return (
    <div>
       <section>      
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
          <Form
            className="mx-auto"
            style={{ minWidth: '650px' }}
            id="navBarSearchForm"
            inline
          >
            <FormControl
              type="text"
              placeholder="Explore food places"
              onChange={e => setTemp(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  redirectHandler();
                }
              }}
            />
            <Button
              className="fa fa-search fa-fw btn-lg myBtn"
              variant="warning"
              onClick={redirectHandler}
            ></Button>
          </Form>
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
              <Nav.Link href="/signup">
                <Button variant="outline-light">Change Password</Button>
              </Nav.Link>
              <Nav.Link onClick={() => (document.cookie = 'Token=')} href="/">
                <Button variant="outline-light">Log out</Button>
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Navbar>

      {redirect === false && (
        <Container style={{ marginTop: '60px' }}>
          <div style={{ fontSize: '100px' }}>
            {restaurantData.name ? restaurantData.name : 'Loading...'}
          </div>
          <ProfileSlider imageUrls={restaurantData.photos} />

          <ReviewContainer restaurantId={match.params.id} ownerId={restaurantData.business_account_id}/>
        </Container>
      )}
      {redirect === true && (
        <Redirect
          to={{
            pathname: url,
            state: { searchTerm: temp },
          }}
        />
      )}
       </section>      

      <div style={{ paddingTop: '30px' }}>
        {' '}
        <Footer />{' '}
      </div>
    </div>
  );
};

export default RestaurantPage;
