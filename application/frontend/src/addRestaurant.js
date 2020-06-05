import React, { Component, Fragment } from 'react';
import axios from 'axios';
import './App.css';
import HeaderWOS from './components/HeaderWOS.js';
import Footer from './components/Footer.js';
import { Container, Button } from 'react-bootstrap';
import SFstateLogo from './assets/SFstateLogo.jpg';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import { Redirect, useHistory } from 'react-router-dom';

const AddRestaurant = () => {
  /*const [email, setEmail] = React.useState('@');*/

  const [redirect, setRedirect] = React.useState(false);
  const [name, setName] = React.useState('');
  const [healthScore, setHealthScore] = React.useState(0);
  const [tags, setTags] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [hours, setHours] = React.useState('');
  const [descript, setDescript] = React.useState('');
  const [images, setImages] = React.useState();
  const [loggedIn, setLI] = React.useState(false);
  const [url, setUrl] = React.useState('');

  const addUser = e => {
    e.preventDefault();
    if (true) {
      setUrl('/');
      setRedirect(true);
   
    }
  };

  React.useEffect(() => {
  window.scrollTo(0, 0)
  const temp = localStorage.getItem('type');
  if(document.cookie.length>20 && temp == 2)
  setLI(true)
  }, []);

  const nameChange = e => {
    e.preventDefault();
    setName(e.target.value);
    console.log(name);
  };
  const locationChange = e => {
    e.preventDefault();
    setLocation(e.target.value);
    console.log(location);
  };
  const descChange = e => {
    e.preventDefault();
    setDescript(e.target.value);
    console.log(descript);
  };
  const imgChange = e => {
    console.log(e.target.files);
    setImages(e.target.files);
  };
  const healthChange = e => {
    setHealthScore(e.target.value);
  };

  const hoursChange = e => {
    setHours(e.target.value);
  };

  const tagChange = e => {
    setTags(e.target.value);
  };

  const handleSubmit = () => {
    console.log('subbmitted');
    const newFormData = new FormData();

    const tagsArray = tags.split(',');

    newFormData.append('name', name);
    newFormData.append('description', descript);
    newFormData.append('tags', tagsArray);
    newFormData.append('openHours', hours);
    newFormData.append('location', location);
    newFormData.append('healthScore', healthScore);
    for (let i = 0; i < images.length; i++) {
      newFormData.append('photos', images[i]);
    }

    // This is using proxy address in package.json to prevent CORS error.
    // withCredentials set to true requires this method
    axios
      .post(`${window.CSC675_ENDPOINT_URL}/api/restaurant`, newFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      })
      .then(res => console.log(res.data))
      .catch(e => console.log(e));
  };

  return (
    <Fragment>
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
      {loggedIn === true && (
      <div style={{ marginTop: '100px' }}>
        <h2>Welcome! <br /> Start adding your restaurant</h2>
        <br />
        <form
          style={{ textAlign: 'left' }}
          className="col-md-3 mx-auto"
          role="form"
        >
          <div className="form-group">
            <label for="location">Name:</label>
            <input onChange={nameChange} class="form-control" placeholder="Cafe 101, Nizario's Pizza, etc" />
          </div>
          <div className="form-group">
            <label for="location">Location:</label>
            <input onChange={locationChange} className="form-control" placeholder="Student Center, Front of Thorton Hall, etc"/>
          </div>
          <div className="form-group">
            <label for="description">Description:</label>
            <input onChange={descChange} className="form-control" placeholder="We have the best coffee you could find on campus"/>
          </div>
          <div className="form-group">
            <label for="description">Hours:</label>
            <input onChange={hoursChange} className="form-control" placeholder="8:00am - 6:00pm, 24/7, etc"/>
          </div>
          <div className="form-group">
            <label for="description">Health Score:</label>
            <input onChange={healthChange} className="form-control" placeholder="your official national heath score [0..100]" />
          </div>
          <div className="form-group">
            <label for="description">Tags:</label>
            <input onChange={tagChange} className="form-control" placeholder="affordable, cozy, etc"/>
          </div>
          <div>
            <label for="image">Upload the profile image of your restaurant: </label>
            <br />
            <input
              type="file"
              name="files[]"
              id="image"
              onChange={imgChange}
              accept="image/png, image/jpeg"
              multiple
              required
            />
          </div>
        </form>
        <br />
        <Button className="mx-auto" variant="dark" onClick={handleSubmit}>
          Submit
        </Button>
        <br />
        <br />
      </div>
      )}
      {loggedIn === false && (
        <Container style={{marginTop:"200px"}}>
          <h1>Please log in with a business account to use this feature</h1><br />
          <Button style={{fontSize:"50px", marginBottom:"200px"}} 
          variant="danger" href="/signin">LOG IN NOW</Button>
          </Container>
      )}

      </section>      

      <Footer />
    </Fragment>
  );
};

export default AddRestaurant;
