import React from 'react';
import InProgress from './loading1.gif';
import './App.css';
import {
  Nav,
  Navbar,
  NavDropdown,
  Badge,
  Form,
  FormControl,
  Container,
  Dropdown,
  Row,
  Button,
  Card,
} from 'react-bootstrap';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Footer from './components/Footer.js';
import StarRatingComponent from 'react-star-rating-component';
import Rating from 'react-star-rating-lite';
import { CardTitle } from 'react-bootstrap/Card';

const ResultPage = () => {
  const location = useLocation();
  const [searchKey, setKey] = React.useState(location.state.searchTerm);
  const [type, setType] = React.useState('Type'); //example filter
  const [result, setResult] = React.useState([]); //the array of search results
  const [price, setPrice] = React.useState('Price');
  const [popular, setPop] = React.useState('outline-secondary'); //example filter
  const [ht, setHT] = React.useState('outline-secondary'); //example filter
  const [loading, setLoading] = React.useState(false); //loading gif
  const [loggedIn, setLI] = React.useState(false);
  const [hscore, setHScore] = React.useState(0);
  const [pscore, setPScore] = React.useState(0);

  React.useEffect(() => {
    console.log(searchKey);
    search();
    if (document.cookie.length > 20) setLI(true);
  }, []);

  //fire filter when hscore or pscore changes
  React.useEffect(() => {
    if ((hscore === 0) & (pscore === 0)) search();
    else filter();
  }, [hscore, pscore]);

  const filter = () => {
    axios
      .get(
        `${window.CSC675_ENDPOINT_URL}/api/restaurant?filterBy=health_score&filterCondition=gt&filterValue=${hscore}
          &filterBy=popularity&filterCondition=gt&filterValue=${pscore}`,
        {
          withCredentials: true,
        },
      )
      .then(res => {
        var temp = res.data.Restaurants.map((result, name) => (
          <Card key={name} className="shadow customcard myClass">
            <Link to={`/restaurant/${result.restaurant_id}`}>
              <Card.Img variant="top" src={result.main_photo} alt="new" />
              <Card.Title>
                <a style={{ fontSize: '30px' }}>{result.name}</a>
                <br />
                <i
                  style={{ color: 'purple' }}
                  class="fa fa-map-marker"
                  aria-hidden="true"
                ></i>{' '}
                {result.location}
                <br />
                <StarRatingComponent
                  editing={false}
                  starCount={5}
                  emptyStarColor={'#e6e2d8'}
                  value={result.average_rating}
                /><br />
                <Badge style={{ marginTop: '10px' }} pill variant="dark">
                  {result.tags}
                </Badge>
                <Badge style={{ marginTop: '10px' }} pill variant="secondary">
                  {result.open_hours}
                </Badge>
              </Card.Title>
              <Card.Text>{result.description}</Card.Text>

              {result.health_score <= 50 && (
                <Card.Footer>
                  Health Score:{' '}
                  <Badge variant="danger">{result.health_score}</Badge>
                </Card.Footer>
              )}

              {result.health_score > 50 && (
                <Card.Footer>
                  Health Score:{' '}
                  <Badge variant="success">{result.health_score}</Badge>
                </Card.Footer>
              )}
            </Link>
          </Card>
        ));
        setLoading(false);
        setResult(temp);
      });
  };

  const filterHT = () => {
    if (ht === 'outline-secondary') {
      setHT('success');
      setResult([]);
      setLoading(true);
      setHScore(51);
    } else {
      setHT('outline-secondary');
      setHScore(0);
    }
  };

  const filterStar = () => {
    if (popular === 'outline-secondary') {
      setPop('info');
      setResult([]);
      setLoading(true);
      setPScore(50);
    } else {
      setPop('outline-secondary');
      setPScore(0);
    }
  };

  const endpoint = searchKey => {
    // Default to get all restaurant if no search key
    if (!searchKey || searchKey === '') {
      return `${window.CSC675_ENDPOINT_URL}/api/restaurant`;
    }

    return `${window.CSC675_ENDPOINT_URL}/api/restaurant?filterBy=name&filterValue=${searchKey}`;
  };

  const search = () => {
    setResult([]);
    setLoading(true);

    axios
      .get(endpoint(searchKey), {
        withCredentials: true,
      })
      .then(res => {
        console.log(res.data.Restaurants);
        var temp = res.data.Restaurants.map((result, name) => (
          <Card key={name} className="shadow customcard myClass">
            <Link to={`/restaurant/${result.restaurant_id}`}>
              <Card.Img variant="top" src={result.main_photo} alt="new" />
              <Card.Title>
                <a style={{ fontSize: '30px' }}>{result.name}</a>
                <br />
                <i
                  style={{ color: 'purple' }}
                  class="fa fa-map-marker"
                  aria-hidden="true"
                ></i>{' '}
                {result.location}
                <br />
                <StarRatingComponent
                  editing={false}
                  starCount={5}
                  emptyStarColor={'#e6e2d8'}
                  value={result.average_rating}
                /><br />
                <Badge style={{ marginTop: '10px' }} pill variant="dark">
                  {result.tags}
                </Badge>
                <Badge style={{ marginTop: '10px' }} pill variant="secondary">
                  {result.open_hours}
                </Badge>
              </Card.Title>
              <Card.Text>{result.description}</Card.Text>

              {result.health_score <= 50 && (
                <Card.Footer>
                  Health Score:{' '}
                  <Badge variant="danger">{result.health_score}</Badge>
                </Card.Footer>
              )}

              {result.health_score > 50 && (
                <Card.Footer>
                  Health Score:{' '}
                  <Badge variant="success">{result.health_score}</Badge>
                </Card.Footer>
              )}
            </Link>
          </Card>
        ));
        setLoading(false);
        setResult(temp);
      });
  };

  return (
    <div>
      <section>
        <div>
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
                  onChange={e => setKey(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      search();
                    }
                  }}
                />
                <Button
                  className="fa fa-search fa-fw btn-lg myBtn"
                  variant="warning"
                  onClick={search}
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

          <div className="col-md-6 mx-auto">
            <div style={{ marginLeft: '20px', marginTop: '90px' }}>
              <Row>
                <Button
                  style={{ marginRight: '20px' }}
                  variant={ht}
                  onClick={filterHT}
                >
                  Healthy <i class="fa fa-smile-o fa-lg" aria-hidden="true"></i>
                </Button>
                <Button
                  style={{ marginRight: '20px' }}
                  variant={popular}
                  onClick={filterStar}
                >
                  Popular <i class="fa fa-thumbs-up fa-lg" aria-hidden="true"></i>
                </Button>
             
              </Row>
            </div>
          </div>

          {loading === true && (
            <img
              style={{ marginTop: '10vh' }}
              className="mx-auto loading"
              src={InProgress}
              alt="Loading"
            />
          )}

          <div className="container-fluid row justify-content-center">
            {result}
            {loading === false && (
              <Card
                style={{ backgroundColor: '#f7f7f7' }}
                className="shadow customcard myClass"
              >
                <Link to={'/addrestaurant'}>
                  <Card.Body>
                    <h4 style={{ fontWeight: '20' }}>
                      Own one? <br />
                    Add your restaurant
                  </h4>
                    <br />
                    <i
                      style={{ color: '#bbc3c9', fontSize: '200px' }}
                      className="fa fa-plus-circle"
                    ></i>
                  </Card.Body>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </section>

      {loading === false && (
        <div style={{ paddingTop: '30px' }}>
          {' '}
          <Footer />{' '}
        </div>
      )}
    </div>
  );
};

export default ResultPage;
