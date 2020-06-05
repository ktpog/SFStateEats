import React from 'react';
import InProgress from './loading.gif';
import './App.css';
import {
  Carousel,
  Container,
  Dropdown,
  Row,
  Button,
  Card,
} from 'react-bootstrap';

const ProfileSlider = ({ imageUrls }) => {
  const renderCarouselItems = () => {
    if (!imageUrls) {
      return null;
    }
    return imageUrls.map(imageUrl => {
      return (
        <Carousel.Item>
          <img
            className="d-block img-fluid"
            style={{
              objectFit: 'cover',
              width: '2000px',
              height: '500px',
              margin: '0 auto',
            }}
            src={imageUrl}
          />
          {/* <Carousel.Caption>
            <h3>{item.header}</h3>
            <p>{item.description}</p>
          </Carousel.Caption> */}
        </Carousel.Item>
      );
    });
  };

  return <Carousel>{renderCarouselItems()}</Carousel>;
};

export default ProfileSlider;
