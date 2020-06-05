const {
  queryGenericSearchV2,
  executeQuery,
  validateFilter,
  validateFilterCondition,
  genericDeleteById,
  createSetStatements,
  createGenericUpdateQuery
} = require("../helpers/queryCreator");

const getBusinessAccount = async (req, res) => {
  const sqlOptions = {
    table: "business_account",
    orderByColumnName: "business_account.business_account_id",
    databaseClient: req.DATABASE_CLIENT
  };

  const urlParamsObject = req.query;
  const successKey = "BusinessAccount";
  const errorMessage = "Failed to get busines accounts";

  const error = validateFilter(urlParamsObject);
  if (error) res.status(400).send(error.error);

  // Make sure the filterCondition is one to one with filterBy if filterCondition field is left empty in the query
  urlParamsObject.filterCondition = validateFilterCondition(urlParamsObject);

  console.log(urlParamsObject);
  console.log("urlParamsObject after validateFilterCondition");

  const owner = {
    ownerColumnName: "account_id",
    ownerId: urlParamsObject.ownerId
  };

  const queryResponse = await queryGenericSearchV2(
    sqlOptions,
    urlParamsObject,
    successKey, // Key where data will be stored as reponse
    errorMessage, // Error message is query fails
    owner // If user wants to query data for a specific owner
    // joinConfig
    // select
  );

  res.send(queryResponse);
};

const getBusinessAccountById = async (req, res) => {
  const query = `
    SELECT * FROM business_account
    WHERE business_account_id = ${req.params.businessAccountId}
  `;

  const data = await executeQuery(
    req.DATABASE_CLIENT,
    query,
    "BusinessAccount",
    `Failed to get single business account of id: ${req.params.restaurantId}`
  );

  console.log(data);

  res.send(data);
};

module.exports = {
  getBusinessAccount,
  getBusinessAccountById
};
