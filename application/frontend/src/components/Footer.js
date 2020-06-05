import React from 'react';
import {
  Container,
  Dropdown,
  Row,
  Button,
  Card,
  Carousel,
  Modal,
  Col,
} from 'react-bootstrap';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import SFstateLogo from '../assets/SFstateLogo.png';





const Footer = () => {
  const [show, setShow] = React.useState(false);

const handleClose = () => setShow(false);
  const handleShow = (id) => {
    setShow(true);
  }
  return (
    <>
    <div id="footer" className="shadow-sm fixed-bot container-fluid">
      <Row>
        <Col style={{ color: 'white' }}>
          <h4>Quick Links</h4>
          <p style={{ align: 'left' }}>
            <Link>All Restaurants</Link>
          </p>
        </Col>

        <Col style={{ color: 'white' }}>
          <h4>Contact Us</h4>
          <p style={{ align: 'left' }}>
            <Button onClick={handleShow}>Click for info</Button>
          </p>
        </Col>
        <Col>
          <img className="FooterLogo" src={SFstateLogo}></img>
        </Col>
      </Row>
    </div>
    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Contact the devs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>Rachit Joshi (Team Lead): rjoshi@mail.sfsu.edu</h6>
          <h6>Pedro Souto (Backend Lead): Pedro.Souto.SFSU@gmail.com</h6>
          <h6>John Pham (GitHub Lead): JohnPhamDeveloper@hotmail.com</h6>
          <h6>Samhita Brigeda (Frontend Lead): pandu.barigeda@gmail.com</h6>
          <h6>Khang Tran (Frontend Dev): ktran26@mail.sfsu.edu</h6>
          <h6>Vicent Tran (Database Lead): vtran6@mail.sfsu.edu</h6>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
          
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Footer;
