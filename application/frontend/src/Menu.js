import React from "react";
import "./App.css";
import axios from "axios";
import { Card, Badge, Row } from "react-bootstrap";
import { Link, BrowserRouter as Router, Route } from "react-router-dom";

const Menu = ({ restaurantId }) => {
  const [menu, setMenu] = React.useState();
  var arr = [];

  const getMenu = () => {

    axios
      .get(`${window.CSC675_ENDPOINT_URL}/api/menu/${restaurantId}`
        , { withCredentials: true })

      .then(res => {
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

  React.useEffect(() => {
    console.log(restaurantId);
    getMenu();
  }, [])

  return (
    <div className="container-fluid row justify-content-center">
      {menu}
    </div>
  )



};
export default Menu;
