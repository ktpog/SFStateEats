const {
  queryGenericSearchV2,
  validateFilter,
  validateFilterCondition,
  genericDeleteById,
  executeQuery
} = require("../helpers/queryCreator");

const TableColumnKey = {
  TABLE_NAME: "Review",
  ID: "review_id",
  OWNER_ID: "reviewer_id",
  REVIEW_NAME: "title",
  STARS: "stars"
};

// GET review?reviewerId={id} // returns all reviews by this user
// GET restaurant/ownerId={id} // returns all restaurantbythisowner}

/**
 * GET restaurants
 * Main params: filterBy
 * Extra params: filterBy, contains, filterCondition, filterValue, orderBy
 */
const getReviews = async (req, res) => {
  const sqlOptions = {
    table: TableColumnKey.TABLE_NAME,
    whereColumnName: TableColumnKey.REVIEW_NAME,
    orderByColumnName: TableColumnKey.REVIEW_NAME,
    databaseClient: req.DATABASE_CLIENT
  };

  const urlParamsObject = req.query;
  const successKey = "Reviews";
  const errorMessage = "Failed to get reviews";

  const error = validateFilter(urlParamsObject);
  if (error) res.status(400).send(error.error);

  // Make sure the filterCondition is one to one with filterBy if filterCondition field is left empty in the query
  urlParamsObject.filterCondition = validateFilterCondition(urlParamsObject);

  const owner = {
    ownerColumnName: TableColumnKey.OWNER_ID,
    ownerId: urlParamsObject.ownerId
  };

  const queryResponse = await queryGenericSearchV2(
    sqlOptions,
    urlParamsObject,
    successKey, // Key where data will be stored as reponse
    errorMessage, // Error message is query fails
    owner
  );

  res.send(queryResponse);
};

const postReview = async (req, res) => {
  if (!req.account_id) {
    return res.send({ error: "Unauthorized user attempting to post review", code: 6000 });
  }

  console.log(req.body);

  console.log(req.restaurantId);
  try {
    await req.DATABASE_CLIENT.query({
      text: `INSERT INTO Review(reviewer_id, restaurant_id, stars, title, description, flagged) VALUES($1, $2, $3, $4, $5, $6)`,
      values: [
        req.account_id,
        req.body.restaurantId,
        req.body.stars,
        req.body.title,
        req.body.description,
        false
      ]
    });
    res.send({ message: "Successfully posted review" });
  } catch (e) {
    console.log(e);
    res.send({ error: "Failed to post review. Missing Fields?", code: 6001 });
  }
};

const deleteReviewById = async (req, res) => {
  // Another special case because if a review is deleted, comments is also deleted
  // REVIEWS and COMMENT is a many to many relationship with the intermediate REVIEW_COMMENT
  // If REVIEWS is deleted then COMMENT_REVIEW will also be deleted by ON CASCADE, but COMMENT will still exist
  // So we need to specifiy another query to run
  // Hard coded for now
  // DELETE ALL Comments that are equal to the given review id
  const extraQuery = `
      DELETE FROM Comment c
      USING Comment_review cr
      WHERE c.comment_id = cr.comment_id AND cr.review_id = ${req.params.reviewId};
    `;

  const config = {
    deleteId: req.params.reviewId,
    deleteColumnName: "review_id",
    accountId: req.admin_id ? null : req.account_id,
    tableName: "Review",
    errorCodeStartRange: 9555,
    tableOwnerColumnName: req.admin_id ? null : "reviewer_id",
    DATABASE_CLIENT: req.DATABASE_CLIENT,
    extraQuery,
    isAdmin: req.admin_id ? true : false
  };
  const result = await genericDeleteById(config);
  res.send(result);
};

const getReviewById = async (req, res) => {
  const query = `
  SELECT * FROM Review
  WHERE review_id = ${req.params.reviewId}
`;

  const data = await executeQuery(
    req.DATABASE_CLIENT,
    query,
    "Review",
    `Failed to get single review of id: ${req.params.reviewId}`
  );

  console.log(data);

  res.send(data);
};

module.exports = {
  getReviews,
  postReview,
  deleteReviewById,
  getReviewById
};
