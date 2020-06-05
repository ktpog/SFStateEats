import React, { useEffect } from 'react';
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

const BeginChangePasswordPage = () => {
  const [message, setMessage] = React.useState('');
  useEffect(() => {
    axios
      .post(
        `${window.CSC675_ENDPOINT_URL}/api/beginChangePassword`,
        {},
        { withCredentials: true },
      )
      .then(res => {
        if (res.data.error) {
          setMessage(res.data.error);
        } else {
          setMessage(
            'An email has been sent to your email address for password change!',
          );
        }
      })
      .catch(e => console.log(e));
  }, []);

  return (
    <>
      <section>
        <div className="App">
          <HeaderWOS />

          <div style={{ marginTop: '100px', height: '500px' }}>
            <h2>{message}</h2>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default BeginChangePasswordPage;
