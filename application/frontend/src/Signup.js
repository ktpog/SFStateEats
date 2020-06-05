import React, { Component, Fragment } from 'react';
import axios from 'axios';
import './signup.css';
import './App.css';
import HeaderWOS from './components/HeaderWOS.js';
import Footer from './components/Footer.js';
import { Modal, Button, Container, ButtonGroup } from 'react-bootstrap';
import SFstateLogo from './assets/SFstateLogo.jpg';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import { Redirect, useHistory } from 'react-router-dom';

const Signup = () => {

  const [username, setUsername] = React.useState('abc');
  const [password, setPassword] = React.useState('123');
  const [name, setName] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [message, setMesg] = React.useState('');
  const [color, setColor] = React.useState('red');
  const [email, setEmail] = React.useState('');
  const [type, setType] = React.useState(1);
  const [token, setToken] = React.useState("");
  const [btn1, setBtn1] = React.useState('outline-dark');
  const [btn2, setBtn2] = React.useState('outline-dark');
  const [btn3, setBtn3] = React.useState('outline-dark');
  const [redirect, setRedirect] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [show, setShow] = React.useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const redirectHandler = () => {
    setUrl('/');
    setRedirect(true);
  };
  

  const addUser = e => {
    e.preventDefault();
    //console.log(username + password + name + dob + type + token);
    axios
      .post(`${window.CSC675_ENDPOINT_URL}/api/account/register`, {
        // Required key-value parameters in POST body: username, password, name, dob (YYYY-MM-DD), type, adminToken
        email: email,
        username: username,
        password: password,
        name: name,
        dob: dob,
        accountType: type,
        adminToken: token

      })
      .then(function(response) {
        if (response.data.error) {
          setMesg(response.data.error);
          setColor('red');
        }
        if (response.data.message) {
          setColor('green');
          setMesg(response.data.message);
        }
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
    <Fragment>
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
      <HeaderWOS />
      <div style={{ marginTop: '100px' }}>
        <h2>Registration</h2>
        <br />

        <form className="col-md-3 mx-auto" role="form">
          <div style={{ textAlign: 'left' }} class="form-group">
            <label for="email">Email:</label>
            <input
              type="email"
              class="form-control"
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div style={{ textAlign: 'left' }} class="form-group">
            <label for="username">Username:</label>
            <input
              type="username"
              class="form-control"
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div style={{ textAlign: 'left' }} class="form-group">
            <label for="pwd">Password:</label>
            <input
              type="password"
              class="form-control"
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div style={{ textAlign: 'left' }} class="form-group">
            <label for="name">Full Name:</label>
            <input
              type="name"
              class="form-control"
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div style={{ textAlign: 'left' }} class="form-group">
            <label for="dob">Date of Birth (YYYY-MM-DD):</label>
            <input
              type="dob"
              class="form-control"
              onChange={e => setDob(e.target.value)}
            />
          </div>
          <div>
          <ButtonGroup className="mr-2" aria-label="First group">
            <Button onClick={e => {setType(e.target.value); setBtn1('dark'); setBtn2('outline-dark'); setBtn3('outline-dark')}} value="2" variant={btn1}>User</Button>{' '}
            <Button onClick={e => {setType(e.target.value); setBtn1('outline-dark'); setBtn2('dark'); setBtn3('outline-dark')}} value="1" variant={btn2}>Business Owner</Button>{' '}
            <Button onClick={e => {setType(e.target.value); setBtn1('outline-dark'); setBtn2('outline-dark'); setBtn3('dark')}} value="3" variant={btn3}>Admin</Button>{' '}
          </ButtonGroup>
          </div>
          {type === "3" && (
            <div>
              <label><b>Enter admin token :</b></label>
              <input type="adminToken" class="form-control" onChange={e => setToken(e.target.value)} />
            </div>
        )}
        <br/>
          <div class="form-group form-check">
            <input
              type="checkbox"
              class="form-check-input"
              id="exampleCheck1"
              required
            />
            <label className="form-check-label" name="terms">
              By clicking here, I agree to the{' '}
            </label>
            <Link onClick={handleShow}> Terms of Service</Link>
          </div>
          <Button className ='btn-lg' variant="danger" onClick={addUser}>
            Sign up
          </Button>
          <p><br />
            Already have an account? {''}
            <a href="/signin" rel="noopener noreferrer">
              Log in
            </a>
          </p>
          <h5 style={{ color: color }}>{message}</h5>
        </form>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Terms of Service</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <b>These Terms of Service are effective as of May 10, 2020. </b>
            <br />
            We expressly reserve the right to change these Terms of Service from
            time to time without notice to you. You acknowledge and agree that
            it is your responsibility to review this Website and these Terms of
            Service from time to time and to familiarize yourself with any
            modifications. We reserve the sole right to either modify or
            discontinue the Website, including any of the Website’s features, at
            any time with or without notice to you. We will not be liable to you
            or any third party should we exercise such right. Any new features
            that augment or enhance the then-current services on this Website
            shall also be subject to these Terms of Service.
            <br />
            Conduct on Website Your use of the Website is subject to all
            applicable laws and regulations, and you are solely responsible for
            the substance of your communications through the Website. By posting
            information in or otherwise using any communications service, chat
            room, message board, newsgroup, software library, or other
            interactive service that may be available to you on or through this
            Website, you agree that you will not upload, share, post, or
            otherwise distribute or facilitate distribution of any content —
            including text, communications, software, images, sounds, data, or
            other information — that:
            <br />
            You agree that we may at any time, and at our sole discretion,
            terminate your membership, account, or other affiliation with our
            site without prior notice to you for violating any of the above
            provisions. In addition, you acknowledge that we will cooperate
            fully with investigations of violations of systems or network
            security at other sites, including cooperating with law enforcement
            authorities in investigating suspected criminal violations.
          </Modal.Body>
        </Modal>
      </div>
      </section>      
      <Footer />
    </Fragment>
  );
};

export default Signup;
