import React from 'react';
import InProgress from './loading.gif';
import './App.css';
import { Tab, Tabs, Container, Dropdown, Row, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import Carousel, { Modal, ModalGateway } from "react-images";
import Gallery from "react-photo-gallery"
import { photos } from "./photos";

const PhotoGallery = () => {

    const [currentImage, setCurrentImage] = React.useState(0);
    const [viewerIsOpen, setViewerIsOpen] = React.useState(false);
  
    const openLightbox = React.useCallback((event, { photo, index }) => {
      setCurrentImage(index);
      setViewerIsOpen(true);
    }, []);
  
    const closeLightbox = () => {
      setCurrentImage(0);
      setViewerIsOpen(false);
    };
    
    return (
 <div>
        <Gallery photos={photos} onClick={openLightbox} />
        <ModalGateway>
          {viewerIsOpen ? (
            <Modal onClose={closeLightbox}>
              <Carousel
                currentIndex={currentImage}
                views={photos.map(x => ({
                  ...x,
                  srcset: x.srcSet,
                  caption: x.title
                }))}
              />
            </Modal>
          ) : null}
        </ModalGateway>
  </div>
    )
    
    
    
    
    
    
}
export default PhotoGallery;