import React from 'react';
import InProgress from './loading.gif';
import './App.css';
import { Form, Dropdown, Row, Button, Card } from 'react-bootstrap';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import RestaurantPage from './RestaurantPage';
import ResultPage from './ResultPage';
import Signin from './Signin';
import Signup from './Signup';
import HomePage from './HomePage';
import addRestaurant from './addRestaurant.js';
import BeginChangePassword from './BeginChangePasswordPage';
import EndChangePassword from './EndChangePasswordPage';
import Dashboard from './Dashboard';
import Admin from './Admin';

// Production will not use PROXY endpoints
if (process.env.NODE_ENV === 'production') {
  console.log('In production');
  window.CSC675_ENDPOINT_URL = 'http://3.12.102.223:3001';
} else {
  console.log('In development');
  window.CSC675_ENDPOINT_URL = ''; // Use proxy instead in package.json
}

function App() {
  return (
    <div className="App">
      <Router>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/restaurant/:id" component={RestaurantPage} />
        <Route exact path="/search/:name" component={ResultPage} />
        <Route exact path="/search/" component={ResultPage} />
        <Route exact path="/signin" component={Signin} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/addrestaurant" component={addRestaurant} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/admin" component={Admin} />
        <Route
          exact
          path="/beginChangePassword"
          component={BeginChangePassword}
        />
        <Route exact path="/endChangePassword" component={EndChangePassword} />
      </Router>
    </div>
  );
}

export default App;
