
import React, { Component } from 'react' ;
import axios from 'axios';
import {
    Button,
    Table,
    FormControl,
    Modal,
    Container,
    Form
  } from 'react-bootstrap';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';  
import { Card, Badge, Row } from "react-bootstrap";

const Dashboard = () => {
    const [allreviews, setAllreviews] = React.useState([]);
    const [id, setID] = React.useState();
    const [type, setType] = React.useState();
    const [userRest, setRest] = React.useState();
    const [showhours, setHShow] = React.useState(false);
    const handleHClose = () => setHShow(false);
    const handleHShow = () => setHShow(true);
    const [showmenu, setMShow] = React.useState(false);
    const handleMClose = () => setMShow(false);
    const handleMShow = () => setMShow(true);
    const [hours, setHours] = React.useState();
    const [newhours, setNewhours] = React.useState();
    const [menu, setMenu] = React.useState();
    const [restID, setRestid] = React.useState();
    const [busID, setBid] = React.useState();
    var arr = [];

    
    const setRestaurantid = (id, hours) =>{
        setRestid(id);
        setHours(hours);
        handleHShow();
    }



    React.useEffect(() => {
        const temp1 = localStorage.getItem('userID');
        const temp2 = localStorage.getItem('type');
        setID(temp1)
        setType(temp2)
        }, [])
    
        React.useEffect(() => {
            if(type == '2') getRest();
            if(type == '3') getReviews();
        }, [type])
            


    const updateMenu = (id) => {
        handleMShow();
        axios
      .get(`${window.CSC675_ENDPOINT_URL}/api/menu/`+ id
        , { withCredentials: true })

      .then(res => {
        console.log(res);
        var temp = res.data.menus;
        for (var key in temp) {
          var menu = res.data.menus[key].map(result =>
            <Card className='shadow-sm menucard'>
              <Badge variant="dark">{result['Menu Name']}</Badge>
              <br />
              <Card.Title>{result['Food Name']}</Card.Title>
              <br />
              <Card.Text>
                <Badge pill variant="light" style={{ fontSize: '18px' }}> ${result.Price}</Badge>
              </Card.Text>
            </Card>)
          arr.push(menu)
        }
        setMenu(arr)
      });
    }

    const updateRestaurant = () => {
        //console.log(restID);
        //console.log(newhours);
        axios.put(`${window.CSC675_ENDPOINT_URL}/api/restaurant/`+ restID, {
            open_hours: newhours
        }, {withCredentials: true}).then(response => {
            console.log(response);
        })
        handleHClose();

    }
    
    const deleteRestaurant = (id) => {
        axios.delete(`${window.CSC675_ENDPOINT_URL}/api/restaurant/`+id, {withCredentials: true}).then(response => {
            //console.log(response);
        })

    }
    

    const deleteReview = (id) => {
        axios.delete(`${window.CSC675_ENDPOINT_URL}/api/review/`+id, {withCredentials: true}).then(response => {
            //console.log(response);
        })
    }
    
    React.useEffect(() => {
        if(id) {
            if(type == 2){
        axios.get(`${window.CSC675_ENDPOINT_URL}/api/businessAccount?filterBy=account_id&filterValue=${id}&filterCondition=eq`
        , {withCredentials: true})
        .then (response => {
           //console.log(response.data.BusinessAccount[0].business_account_id)
             setBid(response.data.BusinessAccount[0].business_account_id); 
        });
    }
    }
    }, [id])

    React.useEffect(() => {
    getRest();
    }, [busID])
    
    const getRest = () => {
        if(busID) {
        axios.get(`${window.CSC675_ENDPOINT_URL}/api/restaurant?ownerId=`+busID, {withCredentials: true}).then(res => {
            //console.log(res);
            var temp = res.data.Restaurants.map((result, name) => {
                return (
                <>
                    <tr key={name}>
                        <td>{result.restaurant_id}</td>
                        <td>{result.name}</td>
                        <td>{result.location}</td>
                        <td>{result.open_hours}</td>
                        <td>
                            <Button onClick={e => deleteRestaurant(e.target.value)} value={result.restaurant_id} variant="danger">Delete</Button>
                            <span> </span> <span> </span>
                            <Button onClick={e => setRestaurantid(e.target.value, result.open_hours)} value={result.restaurant_id}>Update Hours</Button>
                            <span> </span> <span> </span>
                            <Button onClick={e => updateMenu(e.target.value)} value={result.restaurant_id}>Update Menu</Button>
                        </td>
                    </tr>
                </>)
                ;
            });
            setRest(temp);
        })
    }

    }

    const getReviews = () => {
            axios.get(`${window.CSC675_ENDPOINT_URL}/api/review?ownerId=`+id,{
                withCredentials: true,
            },).then(res => {
                //console.log(res);
                var temp = res.data.Reviews.map((result, name) => {
                    return (
                    <>
                        <tr key={name}>
                            <td>{result.review_id}</td>
                            <td>{result.title}</td>
                            <td>{result.stars}</td>
                            <td>{result.description}</td>
                            <td>
                                <Button onClick={e => deleteReview(e.target.value)} value={result.review_id} variant="danger">Delete</Button>
                            </td>
                        </tr>
                    </>)
                    ;
                });
                setAllreviews(temp);
            })
            //console.log('/api/review?owner_id='+id);
        }

    return(
        <>
        <div className='container-fluid' style={{marginTop:'80px'}}>
        {type === '3' && (  
        <div style={{padding:'2% 0 0 0'}}>
            <div>
                <h3>You can delete the reviews you have written by clicking the delete button</h3>
               <br/>
            </div>
            <Button variant='success' onClick={getReviews}>
                Refresh <i className="fa fa-refresh"></i></Button>

            <div style={{padding: '2% 8% 0% 8%'}}>
            <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Review_id</th>
                                <th>Title</th>
                                <th>Rating</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allreviews}
                        </tbody>
                </Table>
            </div>
        </div>
        )}
        {type === '2' && ( 
            <> 
        <div style={{padding:'2% 0 0 0'}}>
            <div>
                <h3>You can manage your restaurants here</h3>
               <br/>
            </div>
            <Link to={'/addrestaurant'}>
            <Button variant='warning'>Add a restaurant</Button>
              </Link><span> </span> <span> </span>
            <Button variant='success' onClick={getRest}>
                Refresh <i className="fa fa-refresh"></i></Button>

            <div style={{padding: '2% 8% 0% 8%'}}>
                <Table>
                    <thead>
                            <tr>
                                <th>Restaurant_id</th>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Hours</th>
                                <th>Action</th>
                            </tr>
                    </thead>
                    <tbody>
                            {userRest}
                    </tbody>
                </Table>
            </div>
        </div>
        <div>

            <Modal show={showmenu} onHide={handleMClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>Update Menu Information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    {menu}
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="danger" onClick={handleMClose}>
                        Cancel
                    </Button>
                    <Button variant="dark" onClick={updateMenu}>
                        Update
                    </Button>
                    </Modal.Footer>
                </Modal>



                <Modal show={showhours} onHide={handleHClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>Update Hour Information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form>
                        <Form.Control
                        as="textarea"
                        onChange={e => setNewhours(e.target.value)}
                        placeholder={hours}
                        rows="5"
                        />
                    </Form>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="danger" onClick={handleHClose}>
                        Cancel
                    </Button>
                    <Button variant="dark" onClick={updateRestaurant}>
                        Update
                    </Button>
                    </Modal.Footer>
                </Modal>
        </div>
        </>
        )}
        </div>
        </>
    )
}

export default Dashboard;
