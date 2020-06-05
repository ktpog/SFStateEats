const {
  queryGenericSearchV2,
  validateFilter,
  validateFilterCondition,
  genericDeleteById,
  executeQuery
} = require("../helpers/queryCreator");

// GET URL: /api/comment
const getComment = async (req, res) => {
  const sqlOptions = {
    table: "comment_review",
    orderByColumnName: "comment.comment_id",
    databaseClient: req.DATABASE_CLIENT
  };

  const urlParamsObject = req.query;
  const successKey = "Comment";
  const errorMessage = "Failed to get comments";

  const error = validateFilter(urlParamsObject);
  if (error) res.status(400).send(error.error);

  // Make sure the filterCondition is one to one with filterBy if filterCondition field is left empty in the query
  urlParamsObject.filterCondition = validateFilterCondition(urlParamsObject);

  const owner = {
    ownerColumnName: "account_id",
    ownerId: urlParamsObject.ownerId
  };

  const joinConfig = {
    joinStatements: [
      "JOIN comment on comment_review.comment_id = comment.comment_id",
      "JOIN review on comment_review.review_id = review.review_id"
    ],
    // This is used to resolve ambiguos referencs if theres two tables that have the same column name
    // Ex. If review_id is in two tables, which one do we use?
    // Here we will specify which table will use which filterBy query
    specifyFilterBy: {
      comment_review: ["comment_review_id", "comment_id", "review_id"]
    }
  };

  const queryResponse = await queryGenericSearchV2(
    sqlOptions,
    urlParamsObject,
    successKey, // Key where data will be stored as reponse
    errorMessage, // Error message is query fails
    owner, // If user wants to query data for a specific owner
    joinConfig
  );
  console.log(queryResponse.Comment);

  let resData = [];

  queryResponse.Comment.forEach(data => {
    resData.push({
      comment: data.comment,
      account_id: data.account_id,
      comment_id: data.comment_id,
      reviewer_id: data.reviewer_id,
      flagged: data.flagged
    });
  });

  console.log(resData);

  res.send(resData);
};

// POST URL: /api/comment
// Body: { review_id: INTEGER, comment: STRING (255) }
const postComment = async (req, res) => {
  if (!req.account_id) {
    return res.send({ error: "Unauthorized user attempting to post comment", code: 8000 });
  }

  const { review_id, comment } = req.body;

  if (!comment) {
    res.send({ error: "Comment is missing", code: 8002 });
  } else if (!review_id) {
    res.send({ error: "Review id is missing", code: 8010 });
  }

  let commentId = "";

  // Post to our comment table
  try {
    const commentQuery = `
        INSERT INTO comment(account_id, comment)
        VALUES(${req.account_id},'${comment}')
        RETURNING comment_id
      `;
    const commentResponse = await req.DATABASE_CLIENT.query(commentQuery);
    commentId = commentResponse.rows[0].comment_id;
  } catch (e) {
    console.log(e);
    return res.send({ error: "Failed to post comment to comment table", code: 8003 });
  }

  // Post to our commentReview table
  try {
    const commentReviewQuery = `
          INSERT INTO comment_review(comment_id, review_id)
          VALUES(${commentId},${review_id})
        `;
    await req.DATABASE_CLIENT.query(commentReviewQuery);
  } catch (e) {
    console.log(e);
    return res.send({ error: "Failed to post comment to commentReview table", code: 8004 });
  }

  res.send({ message: "Successfully posted comment" });
};

const deleteCommentById = async (req, res) => {
  const config = {
    deleteId: req.params.commentId,
    deleteColumnName: "comment_id",
    accountId: req.account_id,
    tableName: "Comment",
    errorCodeStartRange: 9872,
    DATABASE_CLIENT: req.DATABASE_CLIENT
  };

  const result = await genericDeleteById(config);
  res.send(result);
};

const getCommentById = async (req, res) => {
  const query = `
  SELECT * FROM Comment
  WHERE comment_id = ${req.params.commentId}
`;

  const data = await executeQuery(
    req.DATABASE_CLIENT,
    query,
    "Comment",
    `Failed to get single review of id: ${req.params.commentId}`
  );

  console.log(data);

  res.send(data);
};

module.exports = { postComment, getComment, getCommentById, deleteCommentById };
