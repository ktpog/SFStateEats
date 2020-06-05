import React, { useState, useEffect } from 'react';
import InProgress from './loading.gif';
import './App.css';
import HeaderWOS from './components/HeaderWOS.js';
import Footer from './components/Footer.js';
import { Modal, Button } from 'react-bootstrap';
import SFstateLogo from './assets/SFstateLogo.jpg';
import { Container } from 'react-bootstrap';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import queryString from 'query-string';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const EndChangePasswordPage = props => {
  const [hash, setHash] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [color, setColor] = useState('red');
  let query = useQuery();

  useEffect(() => {
    setHash(query.get('hash'));
  }, []);

  const submit = () => {
    axios
      .post(`${window.CSC675_ENDPOINT_URL}/api/endChangePassword?hash=${hash}&password=${password}`, {withCredentials: true})
      .then(response => {
        if (response.data.error) {
          setColor('red');
          setMessage(response.data.error);
        } else {
          setColor('green');
          setMessage('Successfully changed password!');
        }
        console.log(response);
      })
      .catch(error => {
        setColor('red');
        // setMessage(error.message);
        setMessage(error.response.data.error);
      });
  };

  return (
    <>
      <div className="App">
        <HeaderWOS />

        <div style={{ marginTop: '100px', height: '500px' }}>
          <h2>Change Password</h2>
          <br />

          <form className="col-md-3 mx-auto" role="form">
            <div style={{ textAlign: 'left' }} class="form-group">
              <label for="pwd">Password:</label>
              <input
                type="password"
                class="form-control"
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </form>
          <Button className="btn-lg" variant="info" onClick={submit}>
            Submit
          </Button>
          <h5 style={{ marginTop: '20px', color: color }}>{message}</h5>
        </div>
        <br />
        <br />
      </div>
      <Footer />
    </>
  );
};

export default EndChangePasswordPage;
