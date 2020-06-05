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
import Footer from './components/Footer';
import HeaderWOS from './components/HeaderWOS';

const Admin = () => {
    const [allreviews, setAllreviews] = React.useState([]);
    const [id, setID] = React.useState();
    const [type, setType] = React.useState();
    const [userRest, setRest] = React.useState();
    const [showhours, setHShow] = React.useState(false);
    const handleHClose = () => setHShow(false);
    const handleHShow = () => setHShow(true);
    const [showmenu, setMShow] = React.useState(false);
    const [hours, setHours] = React.useState();
    const [newhours, setNewhours] = React.useState();
    const [menu, setMenu] = React.useState();
    const [restID, setRestid] = React.useState();
    const [panel, setPanel] = React.useState(1);
    const [allusers, setUsers] = React.useState();

    
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
            if(type == '1') getRest();
            if(type == '2') getReviews();
        }, [type])

    const updateRestaurant = () => {
        //console.log(restID);
        //console.log(newhours);
        axios.put(`${window.CSC675_ENDPOINT_URL}/api/restaurant/${restID}`, {
            open_hours: newhours
        }).then(response => {
            console.log(response);
        })
        handleHClose();

    }
    
    const deleteRestaurant = (id) => {
        axios.delete(`${window.CSC675_ENDPOINT_URL}/api/restaurant/${id}`).then(response => {
            //console.log(response);
        })

    }
    

    const deleteReview = (id) => {
        axios.delete(`${window.CSC675_ENDPOINT_URL}/api/review/${id}`).then(response => {
            //console.log(response);
        })
    }

    const getRest = () => {
        axios.get(`/api/restaurant?owner_id=${id}`).then(res => {
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
                        </td>
                    </tr>
                </>)
                ;
            });
            setRest(temp);
        })

    }

    const deleteUser = (id) => {
        axios.delete(`${window.CSC675_ENDPOINT_URL}/api/account/${id}`).then(response => {
            console.log(response);
        })
    }



    const getUsers = () => {
        axios.get(`${window.CSC675_ENDPOINT_URL}/api/user`,{withCredentials: true,},).then(res => {
            //console.log(res);
            var temp = res.data.user.map((result, name) => {
                return (
                    <>
                         <tr key={name}>
                            <td>{result.users_id}</td>
                            <td>{result.name}</td>
                            <td>{result.dob}</td>
                            <td>{result.age}</td>
                            <td>
                                <Button onClick={e => deleteUser(e.target.value)} value={result.users_id} variant="danger">Delete</Button>
                            </td>
                        </tr>
                    </>
                )
            });
            setUsers(temp);
        })


    }




    const getReviews = () => {
            axios.get(`${window.CSC675_ENDPOINT_URL}/api/review?ownerId=${id}`,{
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
        }

    return(
        <>
        <>
        <HeaderWOS />
        </>
        <>
        <div className='container-fluid' style={{marginTop:'80px'}}>
            <div style={{padding: '2%'}}>
                <h2>Admin Panel</h2>
                <Button onClick={() => setPanel(1)}>Manage Reviews</Button>
                <span> </span><span> </span>
                <Button onClick={() => setPanel(2)}>Manage Restaurants</Button>
                <span> </span><span> </span>
                <Button onClick={() => setPanel(3)}>Manage Users</Button>
            </div>
        {panel === 1 && (  
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
        {panel === 2 && ( 
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
        {panel === 3 && ( 
            <>
            <Button variant='success' onClick={getUsers}>
                Refresh <i className="fa fa-refresh"></i></Button>
                <br />
                <Table>
                    <thead>
                            <tr>
                                <th>user_id</th>
                                <th>Name</th>
                                <th>DOB</th>
                                <th>Age</th>
                                <th>Action</th>
                            </tr>
                    </thead>
                    <tbody>
                            {allusers}
                    </tbody>
                </Table>
            </>
        )}
        <>
        <Footer />
        </>
        </div>
        </>
        </>
    )
}

export default Admin;