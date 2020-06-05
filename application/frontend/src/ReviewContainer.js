import React, { useEffect } from 'react';
import InProgress from './loading.gif';
import './App.css';
import {
  Tab,
  Tabs,
  Container,
  Dropdown,
  Row,
  Button,
  Card,
} from 'react-bootstrap';
import Review from './Review';
import PhotoGallery from './PhotoGallery';
import Overview from './Overview';
import Menu from './Menu';
import HeaderWOS from './components/HeaderWOS';

const ReviewContainer = ({ name, restaurantId, ownerId }) => {
  useEffect(() => {
    console.log(restaurantId);
    console.log(ownerId);
  }, []);
  return (
    <Tabs
      style={{ marginTop: '10px', fontSize: '18px' }}
      className="nav-justified nav-pills myClass"
      defaultActiveKey="review"
    >
      
      <Tab eventKey="review" title="Reviews">
        <Review restaurantName={name} restaurantId={restaurantId} />
      </Tab>
      <Tab eventKey="menu" title="Menu">
        <br />
      
        <Menu restaurantId={restaurantId}/>
      </Tab>
      <Tab eventKey="photos" title="Photos">
        <PhotoGallery />
      </Tab>
      <Tab
        style={{ textAlign: 'left' }}
        eventKey="contact"
        title="Hours and Contact"
      >
        <br />
        <h5>Hours of Operation :</h5>
        <h6>Monday : 9am - 6pm</h6>
        <h6>Tuesday : 9am - 6pm</h6>
        <h6>Wednesday : 9am - 6pm</h6>
        <h6>Thursday : 9am - 6pm</h6>
        <h6>Friday : 9am - 4pm</h6>
        <h6>Saturday and Sunday : CLOSED</h6>
      </Tab>
    </Tabs>
  );
};

export default ReviewContainer;
