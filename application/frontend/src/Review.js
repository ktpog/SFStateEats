import React from 'react';
import InProgress from './loading.gif';
import './App.css';
import {
  Container,
  Form,
  Card,
  Button,
  FormControl,
  Modal,
  Row,
  Dropdown
}
  from 'react-bootstrap';
import axios from 'axios';
import Gallery from 'react-photo-gallery';
import { photos } from './photos';
import { Redirect } from 'react-router-dom';
import Rating from 'react-star-rating-lite';
import StarRatingComponent from 'react-star-rating-component';

const Review = ({ restaurantName, restaurantId }) => {
  const [show, setShow] = React.useState(false);
  const [review, setReview] = React.useState([]);
  const [commentList, setList] = React.useState([]);
  const [rtitle, setRtitle] = React.useState('');
  const [rstars, setRstars] = React.useState(5);
  const [rdesc, setRdesc] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [redirect, setRedirect] = React.useState(false);
  const [refetch, setRefetch] = React.useState(0);
  const handleClose = () => setShow(false);
  const handleShow = (id) => {
    setShow(true);
    setReviewID(id)
  }
  const [loggedIn, setLI] = React.useState(false);
  const [filter, setFilter] = React.useState(0)
  const [dropdownButton, setButton] = React.useState('All stars')
  const [searchKey, setKey] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [triggerFilter, setTrigger] = React.useState(false)
  const [reviewID, setReviewID] = React.useState();
  const [showR, setShowR] = React.useState(false);
  const [owner, setOwner] = React.useState(false);
  const [busID, setBusID] = React.useState();
  const loading = <img src={InProgress} alt="Loading" />;
  //Check for login
  React.useEffect(() => {
    console.log(restaurantId);
    window.scrollTo(0, 0);
    if (document.cookie.length > 20) setLI(true);
    fetchReviews();
  }, []);

  //Fire refetch review list
  React.useEffect(() => {
    fetchReviews();
  }, [refetch]);


  //Check ownership scope starts
  React.useEffect(() => {
    axios
      .get(`${window.CSC675_ENDPOINT_URL}/api/restaurant/${restaurantId}`, { withCredentials: true })
      .then(res =>
        axios
          .get(`${window.CSC675_ENDPOINT_URL}/api/businessAccount/` + res.data.Restaurant[0].business_account_id), { withCredentials: true })
      .then(res2 => setBusID(res2.data.BusinessAccount[0].account_id))
  }
    , [])

  React.useEffect(() => {
    const temp1 = localStorage.getItem('userID');
    if (temp1 == busID)
      setOwner(true)
  }, [busID])
  //Check ownership scope ends


  //posting review axios call
  const postreview = () => {
    console.log(owner);
    if (owner == true)
      setMessage('Sorry! Owners are not allowed to post reviews for your own restaurants ¯\\_(ツ)_/¯')
    else {
      axios
        .post(`${window.CSC675_ENDPOINT_URL}/api/review`, {
          restaurantId: restaurantId,
          stars: rstars,
          title: rtitle,
          description: rdesc,
        }, { withCredentials: true })
        .then(response => {
          console.log(response);
          setRefetch(refetch + 1);
          setMessage(response.data.message)
        })
        .catch(error => {
          console.log(error.response.data);
        });
      document.getElementById("review-form").reset();
    }
  };

  //posting comment axios call
  const postcomment = e => {
    console.log(reviewID)
    axios
      .post(`${window.CSC675_ENDPOINT_URL}/api/comment`, {
        review_id: reviewID,
        comment: comment
      }, { withCredentials: true })
      .then(response => {
        console.log(response);
        setRefetch(refetch + 1);
        setMessage(response.data.message)
      })
      .catch(error => {
        console.log(error.response.data);
      });
  };

  const getcomment = (id) => {
    console.log(reviewID)
    setMessage('')
    axios.get(`${window.CSC675_ENDPOINT_URL}/api/review?filterBy=review_id&filterValue=${id}`, { withCredentials: true }).then(res => {
      var temp1 = res.data.Reviews.map(result => (
        <Card className="reviewcard">
          <Card.Title>
            {result.title}<br />
            <StarRatingComponent
              editing={false}
              starCount={5}
              value={result.stars}
            />
          </Card.Title>
          <Card.Text>{result.description}</Card.Text>
        </Card>
      ))
      setReview(temp1)
    });
    axios.get(`${window.CSC675_ENDPOINT_URL}/api/comment?filterBy=review_id&filterValue=${id}`, { withCredentials: true }).then(res => {
      var temp2 = res.data.map(result => (
        <Card className="commentcard">
          <Row>
          <i style = {{marginLeft:'20px', marginRight: '10px', color: '#6ea0ba'}} className="fa fa-comment"></i>
          {result.comment}
          </Row>
        </Card>
      ))
      if (temp2 == '')
        setList(<h5 className='text-center'><br />No comments to show</h5>)
      else
        setList(temp2)
    });
    setShowR(true)
  };

  function genRstars(ratedVal) {
    setRstars(ratedVal);
  }

  React.useEffect(() => {
    setReview(loading)
    axios.get(`${window.CSC675_ENDPOINT_URL}/api/review?filterBy=restaurant_id&filterValue=${restaurantId}&filterBy=stars&filterValue=${filter}`, { withCredentials: true }).then(res => {
      var temp = res.data.Reviews.map(result => (
        <Card className="reviewcard">
          <Card.Title>
            {result.title}<br />
            <StarRatingComponent
              editing={false}
              starCount={5}
              value={result.stars}
            />
          </Card.Title>

          <Card.Text>{result.description}</Card.Text>
          <Row style={{ alignSelf: "flex-end" }}>
            <Button id={result.review_id} style={{ marginRight: '20px' }} variant="light" onClick={e => { handleShow(e.target.id) }}>Leave a comment</Button>
            <Button id={result.review_id} variant='light' onClick={e => { getcomment(e.target.id) }}>Show comments</Button>
          </Row>
        </Card>
      ));
      setList('')
      setReview(temp);
    });
  }, [filter, triggerFilter])

  //fuction to trigger when filter state not change
  const trigger = () => {
    if (triggerFilter === false)
      setTrigger(true)
    else
      setTrigger(false)
  }

  React.useEffect(() => {
    if (searchKey == '') fetchReviews();
    else {
      setReview(loading)
      axios.get(`${window.CSC675_ENDPOINT_URL}/api/review?filterBy=restaurant_id&filterValue=${restaurantId}&filterBy=title&filterValue=${searchKey}`, { withCredentials: true }).then(res => {
        var temp = res.data.Reviews.map(result => (
          <Card className="reviewcard">
            <Card.Title>
              {result.title}<br />
              <StarRatingComponent
                editing={false}
                starCount={5}
                value={result.stars}
              />
            </Card.Title>

            <Card.Text>{result.description}</Card.Text>
            <Row style={{ alignSelf: "flex-end" }}>
              <Button id={result.review_id} style={{ marginRight: '20px' }} variant="light" onClick={e => { handleShow(e.target.id) }}>Leave a comment</Button>
              <Button id={result.review_id} variant='light' onClick={e => { getcomment(e.target.id) }}>Show comments</Button>
            </Row>
          </Card>
        ));
        setList('')
        setReview(temp);
      });
    }
  }, [searchKey])


  //fetching all reviews axios call
  const fetchReviews = () => {
    console.log(restaurantId);
    setShowR(false)
    axios
      .get(`${window.CSC675_ENDPOINT_URL}/api/review?filterBy=restaurant_id&filterValue=${restaurantId}`, { withCredentials: true })
      .then(res => {
        console.log(res.data);
        var temp = res.data.Reviews.map(result => (
          <Card className="reviewcard">
            <Card.Title>
              {result.title}<br />
              <StarRatingComponent
                editing={false}
                starCount={5}
                value={result.stars}
              />
            </Card.Title>

            <Card.Text>{result.description}</Card.Text>
            <Row style={{ alignSelf: "flex-end" }}>
              <Button id={result.review_id} style={{ marginRight: '20px' }} variant="light" onClick={e => { handleShow(e.target.id) }}>Leave a comment</Button>
              <Button id={result.review_id} variant='light' onClick={e => { getcomment(e.target.id) }}>Show comments</Button>
            </Row>

          </Card>
        ));
        setList('')
        setReview(temp);
      });
  };

  return (
    <>
      {redirect === false && (
        <Container style={{ marginTop: '3vh' }}></Container>
      )}
      {redirect === true && (
        <Redirect
          to={{
            pathname: url,
          }}
        ></Redirect>
      )}
      <div style={{ textAlign: 'left' }}>
        {loggedIn === false && (
          <div>
            <h5>Please log in to post a review</h5>
            <Button variant="danger" href="/signin">
              Log in now
            </Button>
          </div>
        )}
        {loggedIn === true && (
          <div>
            <Form id="review-form">
              <Form.Label>
                <h5>Write your review: </h5>
                <Rating
                  onClick={genRstars}
                  color="orange"
                  value="5"
                  weight="18"
                />
              </Form.Label>
              <FormControl
                type="text"
                placeholder="Title"
                onChange={e => setRtitle(e.target.value)}
              />
              <Form.Control
                as="textarea"
                onChange={e => setRdesc(e.target.value)}
                placeholder="Enter your thoughts on the place..."
                rows="5"
              />
            </Form>
            <Button
              onClick={postreview}
              style={{ marginTop: '10px' }}
              variant="danger"
            >
              Submit
            </Button> <h5 style={{ color: 'green', textAlign: 'center' }}>{message}</h5>
          </div>
        )}
        <br /> <br />
        <Row><h5 className="col-auto">What others are saying:</h5>
          <Dropdown className="ml-auto mr-3">
            {showR === true &&
              <Button variant='dark' onClick={fetchReviews}>Go Back</Button>}
            {showR === false && (
              <div>
                Search: <input style={{ marginRight: "10px" }} placeholder=" Enter keyword" onChange={e => setKey(e.target.value)} />
                <Dropdown.Toggle variant="dark" id="dropdown-basic">
                  {dropdownButton}  </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => { setFilter(5); trigger(); setButton('5 stars') }}>5 stars</Dropdown.Item>
                  <Dropdown.Item onClick={() => { setFilter(4); trigger(); setButton('4 stars') }}>4 stars</Dropdown.Item>
                  <Dropdown.Item onClick={() => { setFilter(3); trigger(); setButton('3 stars') }}>3 stars</Dropdown.Item>
                  <Dropdown.Item onClick={() => { setFilter(2); trigger(); setButton('2 stars') }}>2 stars</Dropdown.Item>
                  <Dropdown.Item onClick={() => { setFilter(1); trigger(); setButton('1 stars') }}>1 stars</Dropdown.Item>
                  <Dropdown.Item onClick={() => { fetchReviews(); setButton('All stars') }}>All stars</Dropdown.Item>
                </Dropdown.Menu>
              </div>
            )}
          </Dropdown></Row>
        {review} {commentList}
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Write your comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              as="textarea"
              onChange={e => setComment(e.target.value)}
              placeholder="Enter your comments ..."
              rows="5"
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="dark" onClick={() => { postcomment(); handleClose() }}>
            post comment
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default Review;
