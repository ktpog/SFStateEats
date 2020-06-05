import React from 'react';
import InProgress from './loading.gif';
import './App.css';
import HeaderWOS from './components/HeaderWOS.js';
import Footer from './components/Footer.js';
import { Modal, Button } from 'react-bootstrap';
import SFstateLogo from './assets/SFstateLogo.jpg';
import { Container } from 'react-bootstrap';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import { Redirect, useHistory } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './Dashboard';

const Signin = () => {
  const [show, setShow] = React.useState(false);
  const [color, setColor] = React.useState('red');
  const [redirect, setRedirect] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [name, setName] = React.useState('');
  const [pwd, setPwd] = React.useState('');
  const [message, setMesg] = React.useState('');
  const [loggedIn, setLI] = React.useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (document.cookie.length > 20) setLI(true);
  }, []);

  const redirectHandler = () => {
    setUrl('/');
    setRedirect(true);
  };

  const signIn = () => {
    axios
      .post(`${window.CSC675_ENDPOINT_URL}/api/account/login`, {
        username: name,
        password: pwd,
      })
      .then(response => {
        document.cookie = `Token=${response.data.Token}`;
        //console.log(response.data);
        //console.log(document.cookie);
        setColor('green');
        setMesg(response.data.message);

        localStorage.setItem('userID', response.data.user.account_id);
        localStorage.setItem('type', response.data.user.accountType);

        redirectHandler();
      })
      .catch(error => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          setColor('red');

          setMesg(error.response.data.error);

          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
      });
  };

  return (
    <>
 <section>      
   {redirect === false && (
        <Container style={{ marginTop: '5vh' }}></Container>
      )}
      {redirect === true && (
        <Redirect
          to={{
            pathname: url,
          }}
        ></Redirect>
      )}
      <div className="App">
        <HeaderWOS />
        {loggedIn === false && (
          <>
            <div style={{ marginTop: '100px' }}>
              <h2>Log in to SFStateEats</h2>
              <br />

              <form className="col-md-3 mx-auto" role="form">
                <div style={{ textAlign: 'left' }} class="form-group">
                  <label for="email">Username:</label>
                  <input
                    class="form-control"
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div style={{ textAlign: 'left' }} class="form-group">
                  <label for="pwd">Password:</label>
                  <input
                    type="password"
                    class="form-control"
                    onChange={e => setPwd(e.target.value)}
                  />
                </div>
              </form>
              <Button className="btn-lg" variant="info" onClick={signIn}>
                Sign in
              </Button>
              <h5 style={{ marginTop: '20px', color: color }}>{message}</h5>

              <br />
              <br />

              <label>Don't Have an Account ? </label>
              <p></p>
              <Button variant="light" href="/signup">
                Sign Up Here
              </Button>

              <br />
              <br />

              <label>Forgot Password/Username ? </label>
              <p />
              <p />
              <Button variant="light" onClick={handleShow}>
                Click Here
              </Button>
            </div>
            <br />
            <br />

            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Enter your email: </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <input></input>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="danger" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="dark" onClick={handleClose}>
                  Send me
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
        {loggedIn === true && (
          <>
            <Dashboard />
          </>
        )}
      </div>
      </section>      
        <Footer />
    </>
  );
};

export default Signin;
