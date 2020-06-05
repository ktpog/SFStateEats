const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");

const {
  getRestaurants,
  getRestaurantById,
  postRestaurant,
  deleteRestaurantById,
  updateRestaurantById
} = require("./controllers/restaurant.controller");
const {
  getReviews,
  postReview,
  deleteReviewById,
  getReviewById
} = require("./controllers/review.controller");
const { getFoods } = require("./controllers/food.controller");
const { getAllUsers, getUserById, getUserByName } = require("./controllers/user.controller");
const {
  registerAccount,
  loginAccount,
  beginChangePassword,
  endChangePassword,
  getAccounts,
  deleteAccountById
} = require("./controllers/account.controller");
const {
  getBusinessAccount,
  getBusinessAccountById
} = require("./controllers/businessAccount.controller");
const {
  getComment,
  postComment,
  deleteCommentById,
  getCommentById
} = require("./controllers/comment.controller");
const {
  getFoodInMenuByRestaurantId,
  addMenu,
  deleteMenuByID
} = require("./controllers/menu.controller");
const { addFood } = require("./controllers/food.controller");

// Database information
const client = new Client({
  host: "3.12.102.223",
  port: 5432,
  user: "postgres",
  password: "lakecakebake101",
  database: "sfsu"
});

// Connect with the above database information (runs async)
client.connect();

// Express will allow us to easily create a server. The variable App will contain the functionality.
const app = express();
let corsConfig = {};

if (process.env.NODE_ENV === "production") {
  corsConfig = {
    origin: "http://3.12.102.223:3001",
    credentials: true
  };
}

// Any requests will first go through these middlewares before it goes through any of our endpoints
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors(corsConfig)); // Allow cross origin requests (mainly to prevent CORS error)
app.use((req, res, next) => {
  console.log("Inside multiple origins");
  let allowedOrigins = ["http://3.12.102.223:4000", "http://localhost:3000"];
  let origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", true);
  return next();
});
app.use(cookieParser()); // Makes extracting cookies easier (if needed)

// Custom middleware to attach database to request
app.use((req, res, next) => {
  const ip =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  console.log(ip);
  //console.log(req.ip);
  req.DATABASE_CLIENT = client;
  next();
});

// Custom middleware to check valid cookie, and if valid, attach the account_id to request
app.use((req, res, next) => {
  console.log(req.cookies["Token"]);
  if (req.cookies["Token"]) {
    var decoded = jwt.verify(req.cookies["Token"], "csc648CookiesSecret");
    req.account_id = decoded.account_id;
    req.business_account_id = decoded.business_account_id;
    req.admin_id = decoded.admin_id;
    console.log(decoded);
    console.log(req.account_id);
    console.log("--------------------------------------------");
    console.log("Call made by user: ", req.account_id);
    console.log("Business Account Id: ", req.business_account_id);
    console.log("Admin account Id:, ", req.account_id);
    console.log("--------------------------------------------");
  }
  next();
});

// Server will be ran on this port
const port = 3001;

// * * * * * * * * * * * * *
// * RESTAURANT ENDPOINTS  *
// * * * * * * * * * * * * *

// ** GET RESTAURANT BY FILTERS **
// Main req.params: name
// Extra req.params: filterBy, contains, filterCondition, filterValue, orderBy
// Request URL: http://localhost:3000/restaurant?name=Subway
app.get("/api/restaurant", getRestaurants);

// ** GET RESTAURANT BY ID **
// Request URL: http://localhost:3000/restaurant/12
// req.params: {"restaurantId": "12"}
app.get("/api/restaurant/:restaurantId", getRestaurantById);
app.put("/api/restaurant/:restaurantId", updateRestaurantById);
app.post("/api/restaurant", postRestaurant);
app.get("/api/restaurant/:restaurantId", getRestaurantById);
app.delete("/api/restaurant/:restaurantId", deleteRestaurantById);

// * * * * * * * * * * *
// * REVIEW ENDPOINTS  *
// * * * * * * * * * * *

app.get("/api/review", getReviews);
app.post("/api/review", postReview);
app.delete("/api/review/:reviewId", deleteReviewById);
app.get("/api/review/:reviewId", getReviewById);
// app.post("/api/review/comment", postComment);

// * * * * * * * * * * *
// * COMMENT ENDPOINTS *
// * * * * * * * * * * *

app.post("/api/comment", postComment);
app.get("/api/comment", getComment);
app.get("/api/comment/:commentId", getCommentById);
app.delete("/api/comment/:commentId", deleteCommentById);

// * * * * * * * * * *
// * Menu ENDPOINTS  *
// * * * * * * * * * *

// ** GET MENU BY RESTAURANT ID **
// Request URL: http://localhost:3000/menu/42
app.get("/api/menu/:restaurantId", getFoodInMenuByRestaurantId);

// ** DELETE MENU BY MENU ID**
// Request URL: http://localhost:3000/menu/42
app.delete("/api/menu/:restaurantId", deleteMenuByID);

// ** ADD MENU **
// Request URL: http://localhost:3000/menu
// Required key-value parameters in info: menuName, restaurantId
app.post("/api/menu", addMenu);

// * * * * * * * * * *
// * FOOD ENDPOINTS  *
// * * * * * * * * * *

// ** ADD Food **
// Request URL: http://localhost:3000/food/add
// Required key-value parameters in info: name, price, menuID
app.post("/api/food", addFood);

// * * * * * * * * * *
// * USER ENDPOINTS  *
// * * * * * * * * * *

// ** GET ALL USERS **
// Request URL: http://localhost:3000/user
app.get("/api/user", getAllUsers);

// Request URL: http://localhost:3000/user/42
// req.params: {"userId": "42"}
app.get("/api/user/:userId(\\d+)", getUserById);

// Request URL: http://localhost:3000/user/jose
// req.params: {"name": "jose"}
// If you want to search first and last name at the same time, use '-' to seperate names, instead of spaces
app.get("/api/user/:name([a-zA-Z-]+)", getUserByName);

// * * * * * * * * * * * *
// * ACCOUNT  ENDPOINTS  *
// * * * * * * * * * * * *
app.get("/api/account", getAccounts);
app.delete("/api/account/:accountId", deleteAccountById);

// * REGISTER ACCOUNT **
// Request URL: http://localhost:3000/account/register
// Required key-value parameters in POST body: username, password, name, dob (YYYY-MM-DD), accountType (1- Business Account; 2 - Registered User; 3 - Admin), adminToken (Only if creating admin account)
app.post("/api/account/register", registerAccount);

// ** LOGIN ACCOUNT **
// Request URL: http://localhost:3000/account/login
// Required key-value parameters in POST body: username, password
app.post("/api/account/login", loginAccount);

app.post("/api/beginChangePassword", beginChangePassword);
app.post("/api/endChangePassword", endChangePassword);

// Business
app.get("/api/businessAccount/:businessAccountId", getBusinessAccountById);
app.get("/api/businessAccount", getBusinessAccount);

// This will run our server on the given port. The second argument will be ran when the server has been successfully run.
// The second argument is a function being passed in. It's a function with no name which means it's an anonymous function.
app.listen(port, () => console.log(`Server is running on port: ${port}`));

// For testing
module.exports = app;
