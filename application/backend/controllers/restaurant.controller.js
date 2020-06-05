const {
  queryGenericSearchV2,
  executeQuery,
  validateFilter,
  validateFilterCondition,
  genericDeleteById,
  createSetStatements,
  createGenericUpdateQuery
} = require("../helpers/queryCreator");
const { upload } = require("../helpers/uploader");
const multiparty = require("multiparty");
const multer = require("multer");
const fs = require("fs");
const fileType = require("file-type");

/**
 * These are the STRING representation for the column names in our database to
 * help prevent misspelling
 */
const TableColumnKey = {
  TABLE_NAME: "Restaurant",
  ID: "restaurant_id",
  OWNER_ID: "business_account_id",
  RESTAURANT_NAME: "name",
  POPULARITY: "popularity"
};

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "/temp/my-uploads");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

var upload2 = multer({ storage: storage }).array("file");

// ** GET RESTAURANT BY FILTERS **
// Request URL: /api/restaurant?filterBy=name&filterValue=chipotle&filterBy=popularity&filterValue=20&filterBy=health_score&filterValue=32
const getRestaurants = async (req, res) => {
  const sqlOptions = {
    table: TableColumnKey.TABLE_NAME,
    orderByColumnName: "Restaurant.name",
    databaseClient: req.DATABASE_CLIENT
  };

  const urlParamsObject = req.query;
  const successKey = "Restaurants";
  const errorMessage = "Failed to get restaurants";

  const error = validateFilter(urlParamsObject);
  if (error) res.status(400).send(error.error);

  // Make sure the filterCondition is one to one with filterBy if filterCondition field is left empty in the query
  urlParamsObject.filterCondition = validateFilterCondition(urlParamsObject);

  console.log(urlParamsObject);
  console.log("urlParamsObject after validateFilterCondition");

  const owner = {
    ownerColumnName: TableColumnKey.OWNER_ID,
    ownerId: urlParamsObject.ownerId
  };

  // FOR a specific select statemene

  const joinConfig = {
    joinStatements: ["LEFT JOIN Review on Review.restaurant_id = Restaurant.restaurant_id"],
    // This is used to resolve ambiguos referencs if theres two tables that have the same column name
    // Ex. If review_id is in two tables, which one do we use?
    // Here we will specify which table will use which filterBy query
    specifyFilterBy: {
      Restaurant: ["restaurant_id", "name"]
    }
  };

  // Average reviews
  const groupBy = {
    groupStatements: ["GROUP BY restaurant.restaurant_id"]
  };

  const select = [
    "restaurant.restaurant_id",
    "restaurant.name",
    "restaurant.description",
    "ROUND(AVG(review.stars), 1) as average_rating",
    "restaurant.health_score",
    "restaurant.popularity",
    "restaurant.open_hours",
    "restaurant.tags",
    "restaurant.expired",
    "restaurant.main_photo",
    "restaurant.photos",
    "restaurant.location",
    "restaurant.business_account_id"
  ];

  //filterChain=AND filterChain=OR

  sqlOptions.select = select;
  sqlOptions.groupBy = groupBy;

  const queryResponse = await queryGenericSearchV2(
    sqlOptions,
    urlParamsObject,
    successKey, // Key where data will be stored as reponse
    errorMessage, // Error message is query fails
    owner, // If user wants to query data for a specific owner
    joinConfig,
    select
  );

  res.send(queryResponse);
};

const postRestaurant = async (req, res) => {
  console.log("trying to post restaurant...");
  console.log(req.account_id);
  if (!req.account_id) {
    return res
      .status(400)
      .send({ error: "Unauthorized user attempting to post restaurant", code: 7003 });
  } else if (!req.business_account_id) {
    return res.status(400).send({ error: "You are not a business owner", code: 7004 });
  }

  const form = new multiparty.Form();

  // Currently only uploads single photos
  form.parse(req, async (error, fields, files) => {
    if (error) throw new Error(error);
    try {
      if (!files.photos) return res.status(400).send({ error: "No images attached", code: 7000 });
      const photoURLs = [];
      // Each photo to be uploaded
      for (let i = 0; i < files.photos.length; i++) {
        const path = files.photos[i].path;
        const stat = fs.statSync(path);
        console.log(stat);
        // Images should only be less 2mb
        if (stat.size > 2000000) {
          return res
            .status(400)
            .send({ error: "Images should be less than 2mb in size", code: 7001 });
        }

        const buffer = fs.readFileSync(path);
        const type = await fileType.fromBuffer(buffer);
        // Check if valid image format

        if (type.ext !== "jpg" && type.ext !== "png" && type.ext !== "jpeg") {
          return res
            .status(400)
            .send({ error: "Images should only be in jpg, jpeg, png format", code: 7002 });
        }

        const timestamp = Date.now().toString();
        const fileName = `sfsufinalprojectteam/${timestamp}-${i}-lg`;
        console.log("before upload");
        const data = await upload(buffer, fileName, type);
        const photoURL = `${data.Location}`;
        photoURLs.push(photoURL);
      }
      const photoURLsJoined = `{${photoURLs.join(",")}}`; // {url, url2}
      const mainPhoto = `{${photoURLs[0]}}`;

      const tags = `{${fields.tags.join(",")}}`;

      try {
        const restaurant_id = await req.DATABASE_CLIENT.query({
          text: `INSERT INTO Restaurant(name, description, tags, open_hours, popularity, health_score, photos, main_photo, expired, location, business_account_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING restaurant_id`,
          values: [
            fields.name[0],
            fields.description[0],
            tags,
            fields.openHours[0],
            0,
            fields.healthScore[0],
            photoURLsJoined, // add this photoURL into photos array
            mainPhoto, // Main photos of website (main gallery?)
            fields.expired ? fields.expired[0] : null,
            fields.location[0],
            req.business_account_id
          ]
        });
      } catch (e) {
        console.log(e);
        return res.status(500).send({
          error:
            "Failed to upload restaurant. Possibly invalid arguments for inserting into table?",
          code: 7006
        });
      }
      return res.status(200).send({ message: "Restaurant created", code: 7500 });
    } catch (error) {
      console.log(error);
      return res.status(400).send(error);
    }
  });
};

const deleteRestaurantById = async (req, res) => {
  // If the original table isn't using the accounts table for identifying the ownership, then
  // Specify the the ownership identity by these parameters
  const differentOwner = {
    columnName: "business_account_id", // use this column name instead of the default for identifying the owner
    tableName: "business_account", // use this table instead of the default for identifying the owner
    ownerId: req.business_account_id // use business account id as identifier instead of the default
  };

  console.log(req.admin_id);

  const config = {
    deleteId: req.params.restaurantId,
    deleteColumnName: "restaurant_id",
    accountId: req.admin_id ? null : req.account_id,
    tableName: "Restaurant",
    errorCodeStartRange: 10555,
    tableOwnerColumnName: req.admin_id ? null : "business_owner_id",
    DATABASE_CLIENT: req.DATABASE_CLIENT,
    differentOwner: req.admin_id ? null : differentOwner,
    isAdmin: req.admin_id ? true : false
  };

  const result = await genericDeleteById(config);
  res.send(result);
};

// ** GET RESTAURANT BY ID **
// Request URL: http://localhost:3000/restaurant/12
// req.params: {"restaurantId": "12"}
const getRestaurantById = async (req, res) => {
  const query = `
  SELECT * FROM ${TableColumnKey.TABLE_NAME}
  WHERE ${TableColumnKey.ID} = ${req.params.restaurantId}
`;

  const data = await executeQuery(
    req.DATABASE_CLIENT,
    query,
    "Restaurant",
    `Failed to get single restaurant of id: ${req.params.restaurantId}`
  );

  console.log(data);

  res.send(data);
};

const updateRestaurantById = async (req, res) => {
  const setStatements = createSetStatements(req.body);

  console.log(setStatements);

  if (setStatements.length <= 0) {
    return res.send({ error: "No parameters", code: 12111 });
  }

  const config = {
    tableName: "Restaurant",
    whereColumnName: "restaurant_id",
    whereColumnValue: req.params.restaurantId,
    setStatements
  };

  const genericQuery = createGenericUpdateQuery(config);

  const data = await executeQuery(
    req.DATABASE_CLIENT,
    genericQuery,
    "Restaurant",
    `Failed to update restaurant`
  );

  console.log(data);

  if (data.error) {
    res.send({ error: data.error });
  } else {
    res.send({ message: "Restaurant updated" });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  postRestaurant,
  deleteRestaurantById,
  updateRestaurantById
};
