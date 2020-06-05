/**
 * Returns a database query that allows the user to combine up to two MAIN search params (such as name and filterBy)
 *
 * @param {Object} sqlOptions
 * @param {String} queryParam
 * @param {String} searchQueryKey
 * @param {String} successKey
 * @param {String} errorMessage
 */
const queryGenericSearchV2 = async (
  sqlOptions,
  queryParam,
  successKey,
  errorMessage,
  owner,
  joinConfig = {}
) => {
  // Extract information from the URL the frontend passed up
  let { ownerColumnName, ownerId } = owner;
  let { orderBy } = queryParam;

  // Default ordering to ASCENDING if it's not specified by URL
  if (!orderBy || orderBy !== "ASC" || orderBy !== "DESC") orderBy = "ASC";
  sqlOptions.orderByValue = orderBy;

  // User selected OR or AND for where chaining statements
  sqlOptions.filterChain = queryParam.filterChain;

  // Query to execute later
  let query = "";

  // User want to join tables
  if (joinConfig) {
    sqlOptions.joinStatements = joinConfig.joinStatements;
  }

  console.log("\n\nPassing into getCompleteWhereStatement");
  console.log(queryParam);
  console.log("\n\n");

  // We may have multiple WHERE statements in our query
  const whereStatements = getCompleteWhereStatement(queryParam, owner, joinConfig);

  console.log(queryParam);

  // * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Note: Query will default to get ALL data
  // * * * * * * * * * * * * * * * * * * * * * * * * * * *
  sqlOptions.whereStatements = whereStatements; // Append WHERE statements to our query
  query = createSearchQuery(sqlOptions);

  // * * * * * * * * * * * * * * * * * * * * * * * *
  // Execute Query
  // * * * * * * * * * * * * * * * * * * * * * * * *
  const queryResponse = await executeQuery(
    sqlOptions.databaseClient,
    query,
    successKey,
    errorMessage
  );

  return queryResponse;
};

const validateFilter = query => {
  // Go through each filterBy, filterCondition, and filterValue in 1-to-1 order
  // Ex) filterBy[0] and filterCondition[0] and filterValue[0] correlate to eachother
  // All three fields MUST HAVE the same length or else we error out

  // V2 filterIntent (number or string in filtervalue) and filterChain (AND or OR)
  const { filterBy, filterCondition, filterValue } = query;

  const filterLength = Array(filterBy).length;
  if (Array(filterValue).length !== filterLength) {
    return { error: "Some filters are missing a required field" };
  }
};

/**
 * Execute SQL query
 *
 * @param {Object} databaseClient
 * @param {String} query - SQL query statement
 * @param {String} successKey - Key property that will be contain the data
 * @param {String} errorMessage
 */
const executeQuery = async (databaseClient, query, successKey, errorMessage) => {
  console.log("Executing query");
  console.log(query);
  try {
    const response = await databaseClient.query(query);
    const newRes = {};
    newRes[successKey] = response.rows;
    return newRes;
    //res.send({ restaurants: response.rows });
  } catch (e) {
    //console.log(e.stack);
    console.log(e.stack);
    return { error: errorMessage };
    //res.status(500).send({ error: error });
  }
};

const createSetStatements = body => {
  let setStatements = [];
  let isFirstPass = true; // First pass needs a 'SET' initial string

  // Go through each property in the body and extract the ones that are not undefined
  for (let property in body) {
    // Check if the property value is not undefined
    const restaurantPropertyValue = body[property];
    if (restaurantPropertyValue) {
      if (isFirstPass) {
        setStatements.push(`SET ${property} = '${restaurantPropertyValue}'`);
        isFirstPass = false;
      } else {
        setStatements.push(`${property} = '${restaurantPropertyValue}'`);
      }
    }
  }

  return setStatements;
};

const createGenericUpdateQuery = config => {
  const { tableName, whereColumnName, whereColumnValue, setStatements } = config;

  const query = `
  UPDATE ${tableName}
  ${setStatements.join(", ")}
  WHERE ${whereColumnName} = ${whereColumnValue}
`;
  console.log(query);

  return query;
};

const validateFilterCondition = query => {
  console.log("Inside validateFilterCondition");
  const { filterBy, filterCondition } = query;
  let newFilterCondition = [];

  // console.log(filterBy);
  // console.log(filterCondition);
  // console.log("end case");

  // CASE 1: filterCondition has one value
  if (!Array.isArray(filterCondition) && Array.isArray(filterBy)) {
    // console.log("CASE 1");
    // console.log(filterCondition);
    // newFilterCondition.push(filterCondition);
    // Fill rest of filter condition with 'equal' 1-to-1 with filterBy
    for (let i = 0; i < filterBy.length; i++) {
      newFilterCondition.push("equal");
    }
  }
  // CASE 2: filter condition was never passed in by paramter
  else if (!filterCondition && Array.isArray(filterBy)) {
    console.log("CASE 2");
    // Fill rest of filter condition with 'equal' t-to-1 with filterBy
    for (let i = 0; i < filterBy.length; i++) {
      newFilterCondition.push("equal");
    }
  }
  // CASE 3: filter condition never passed in by filterBy is not an array
  else if (!filterCondition && !Array.isArray(filterBy)) {
    console.log("CASE 3");
    newFilterCondition = "equal";
  } else {
    newFilterCondition = filterCondition;
  }

  return newFilterCondition;
};

// GENERIC DELETE
//
// See examples for different cases in the controllers
//
// deleteId - id to delete
// deleteColumnName  - the column name for the id to delete (ex. restaurant_id)
// accountId - the account id of the person accessing this route
// tableName - table where the id will be deleted (first letter should be capatalized just incase)
// errorCodeStartRange - the error code sent back will start from here and increment by one
// DATABASE_CLIENT - to query
// tableOwnerColumnName - The column name which will identify the 'ownerId' owner in the 'tableName'
//                         Ex. if we want to delete a restaurant, then the tableName would be Restaurant and the tableOwnerColumnName would be the business_owner_id
//                             because that is what identifies the owner of the restaurant we are trying to delete
// differentOwner (OPTIONAL) - Special cases for tables that do not have any relationship to the accounts table.
//                             This option will a table other accounts for determining the owner (ex. use business_account table instead of accounts_table)
// isAdmin - (OPTIONAL) Bypasses owner check if they are admin

/**
 * V2 Paramters
 * select - [array] - Which specific fields to return from the query. Most useful if your using joins
 *        Ex) ['restaurant.name', 'restaurant.description', 'users.name']
 */
const genericDeleteById = async config => {
  const {
    deleteId,
    deleteColumnName,
    accountId,
    tableName,
    DATABASE_CLIENT,
    tableOwnerColumnName,
    differentOwner,
    extraQuery,
    isAdmin
  } = config;

  let { errorCodeStartRange } = config;

  let errorIncrement = 1;
  let result = "";

  console.log(`Attempting to delete ${tableName} of: ${deleteId}`);

  // Admins will bypass the owner check
  if (!isAdmin) {
    console.log("Deleting not by admin...");
    // Verify logged in
    if (!accountId) {
      result = {
        error: `Unauthorized user attempting to delete ${tableName}`,
        code: errorCodeStartRange
      };
      errorCodeStartRange += errorIncrement;
      return Promise.resolve(result);
    }
    let response = "";

    // Special cases for tables that do not have any relationship to the accounts table
    // We will check for other ways to identify the owner if specified in the config argument
    if (differentOwner) {
      try {
        response = await DATABASE_CLIENT.query(`
        SELECT ${differentOwner.tableName}.${differentOwner.columnName} as owner_id FROM ${differentOwner.tableName}
        JOIN ${tableName} ON ${tableName}.${differentOwner.columnName} = ${differentOwner.tableName}.${differentOwner.columnName}
        WHERE ${deleteColumnName} = ${deleteId}
        LIMIT 1`);
        console.log(tableOwnerColumnName);
        console.log(tableName);
        console.log(deleteColumnName);
        console.log(deleteId);
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        // Extract the column which identifies the owner in the tableName
        // Ex. if we want to delete a restaurant, then the tableName would be Restaurant and the tableOwnerColumnName would be the business_owner_id
        // because that is what identifies the owner of the restaurant we are trying to delete
        response = await DATABASE_CLIENT.query(`
        SELECT ${tableOwnerColumnName} as owner_id FROM ${tableName}
        WHERE ${deleteColumnName} = ${deleteId}
        LIMIT 1
    `);
        console.log(tableOwnerColumnName);
        console.log(tableName);
        console.log(deleteColumnName);
        console.log(deleteId);
      } catch (e) {
        console.log(e);
      }
    }

    // Nothing to delete
    // Note: The intent of the above queries was to check if they were the owner and not really if the data existed
    if (response.rows.length <= 0) {
      result = {
        message: `That ${tableName} does not exist to be deleted. No action taken.`
      };
      return Promise.resolve(result);
    }

    // Default to accountId as ownership using the Account table
    let ownerId = accountId;

    // Using differetn ownerId
    if (differentOwner) {
      ownerId = differentOwner.ownerId;
    }

    console.log(ownerId);
    console.log(response.rows[0]);

    // Not the owner
    // Note: This was the real intent of 'response'; to check if they were the owner of the data to be deleted
    if (response.rows[0].owner_id !== ownerId) {
      result = {
        error: `You cannot delete this ${tableName} because your not an admin or the ${tableName} owner`,
        code: errorCodeStartRange + errorIncrement
      };
      errorCodeStartRange += errorIncrement;
      return Promise.resolve(result);
    }
  }

  // Run extra queries that was specified in options
  if (extraQuery) {
    // console.log("running extra query");
    console.log(extraQuery);
    try {
      const extraQueryResponse = await DATABASE_CLIENT.query(extraQuery);
      // console.log("extra result: ");
      // console.log(extraQueryResponse);
    } catch (e) {
      console.log(e);
    }
  }

  let deleteResponse = "";
  try {
    deleteResponse = await DATABASE_CLIENT.query(`
    DELETE FROM ${tableName} WHERE ${deleteColumnName} = ${deleteId} RETURNING ${deleteColumnName}`);
  } catch (e) {
    console.log(e);
  }

  result = {
    message: `${tableName} deleted for id of ${deleteResponse.rows[0][deleteColumnName]}`
  };

  return Promise.resolve(result);
};

const createSearchQuery = sqlOptions => {
  const {
    table,
    whereStatements,
    joinStatements,
    orderByColumnName,
    orderByValue,
    filterChain
  } = sqlOptions;

  let userWhereAppend = " AND "; // defaults to AND

  console.log(filterChain);

  if (filterChain && filterChain.toLowerCase() === "or") {
    userWhereAppend = " OR ";
  }

  let { select, groupBy } = sqlOptions;

  if (!select) {
    select = "*";
  } else {
    select = select.join(",");
  }

  if (!groupBy) {
    groupBy = "";
  } else {
    console.log(groupBy);
    groupBy = groupBy.groupStatements.join(",");
  }

  if (
    whereStatements &&
    whereStatements.length > 0 &&
    joinStatements &&
    joinStatements.length > 0
  ) {
    //console.log(whereStatements.join(" AND "));
    console.log(whereStatements);
    return `
      SELECT ${select} FROM ${table}
      ${joinStatements.join(" ")}
      ${whereStatements.join(` ${userWhereAppend} `)}
      ${groupBy}
      ORDER BY ${orderByColumnName} ${orderByValue}
    `;
  } else if (whereStatements && whereStatements.length > 0) {
    //console.log(whereStatements.join(` ${userWhereAppend} `));
    console.log(whereStatements);
    return `
      SELECT ${select} FROM ${table}
      ${whereStatements.join(` ${userWhereAppend} `)}
      ${groupBy}
      ORDER BY ${orderByColumnName} ${orderByValue}
    `;
  } else if (joinStatements && joinStatements.length > 0) {
    //console.log(whereStatements.join(` ${userWhereAppend} `));
    console.log(whereStatements);
    return `
      SELECT ${select} FROM ${table}
      ${joinStatements.join(" ")}
      ${groupBy}
      ORDER BY ${orderByColumnName} ${orderByValue}
    `;
  }
  // No join statements
  else {
    return `
      SELECT ${select} FROM ${table}
      ORDER BY ${orderByColumnName} ${orderByValue}
    `;
  }
};

/**
 * Returns a WHERE statement based on queryOptions for filtering
 *
 * @param {Object} queryOptions
 */
const getFilterWhereStatement = (queryOptions, joinAppend) => {
  // We can handle differently if its a numer or a string
  const { filterBy, filterCondition, filterValue } = queryOptions;

  // Tag filters will be handled differentl since they use a different SQL statement
  if (filterBy.toLowerCase() === "tag") {
    return getTagWhereStatement(filterValue);
  } else if (filterValue.toLowerCase() === "true" || filterValue.toLowerCase() === "false") {
    return getBoolWhereStatement(filterBy, filterValue);
  }

  console.log("Deciding which filterCondition to use...");
  console.log(filterCondition);

  // Check if filterValue is string or number to determine how we'll evaluate it
  // filterValue of string will only have equals for now
  if (!isNaN(filterValue)) {
    if (filterCondition === "lt") {
      return `${joinAppend}${filterBy} < '${filterValue}'`;
    } else if (filterCondition === "gt") {
      console.log("here");
      return `${joinAppend}${filterBy} > '${filterValue}'`;
    } else {
      return `${joinAppend}${filterBy} = '${filterValue}'`;
    }
  } else {
    // Not a number so evalute with LIKE (later on we might need contains but for now this will do)
    return `REPLACE(${joinAppend}${filterBy}, ' ', '') ILIKE REPLACE('%${filterValue}%', ' ', '')`;
  }
};

const getTagWhereStatement = filterByTag => {
  return `'${filterByTag}' ILIKE ANY(tags)`;
};

const getBoolWhereStatement = (filterByBool, filterByValue) => {
  return `${filterByBool} IS ${filterByValue}`;
};

const getAmbigStatement = (specifyFilterBy, filterBy) => {
  let statement = "";
  // Check which table this where statement should be using this filterBy property if neccessary
  for (const tableProperty in specifyFilterBy) {
    specifyFilterBy[tableProperty].forEach(columnName => {
      if (columnName === filterBy) {
        statement = `${tableProperty}.`;
      }
    });
  }

  return statement;
};

const getCompleteWhereStatement = (queryParam, owner, joinConfig) => {
  const { specifyFilterBy } = joinConfig;

  let whereStatements = [];
  let joinAppend = "";

  let { filterBy, filterCondition, filterValue } = queryParam;
  // There are multiple filters
  if (Array.isArray(filterBy)) {
    console.log("Multiple filter by statements");
    // Initial filter for our initial WHERE clause
    let currentFilter = {
      filterBy: filterBy[0],
      filterCondition: filterCondition ? filterCondition[0] : "equal",
      filterValue: filterValue[0]
    };

    console.log(currentFilter);

    joinAppend = getAmbigStatement(specifyFilterBy, specifyFilterBy, currentFilter.filterBy);

    // First statements needs the WHERE clause
    whereStatements.push(`WHERE ${getFilterWhereStatement(currentFilter, joinAppend)}`);
    joinAppend = "";

    // Push each filter into our list of where statements
    for (let i = 1; i < filterBy.length; i++) {
      // Note: if filter condition is null it will default to equals
      currentFilter = {
        filterBy: filterBy[i],
        filterCondition: filterCondition ? filterCondition[i] : "equal",
        filterValue: filterValue[i]
      };

      joinAppend = getAmbigStatement(specifyFilterBy, currentFilter.filterBy);

      whereStatements.push(`${getFilterWhereStatement(currentFilter, joinAppend)}`);
      joinAppend = "";
    }

    joinAppend = getAmbigStatement(specifyFilterBy, owner.ownerColumnName);

    if (owner.ownerId)
      whereStatements.push(`${joinAppend}${owner.ownerColumnName} = ${owner.ownerId}`);
    joinAppend = "";
  }
  // There is only one filter so we only have one where statement
  else if (filterBy) {
    console.log("Only one filterBy statement");
    joinAppend = getAmbigStatement(specifyFilterBy, filterBy);
    console.log(joinAppend);
    whereStatements.push(`WHERE ${getFilterWhereStatement(queryParam, joinAppend)}`);
    joinAppend = "";

    joinAppend = getAmbigStatement(specifyFilterBy, owner.ownerColumnName);
    if (owner.ownerId)
      whereStatements.push(`${joinAppend}${owner.ownerColumnName} = ${owner.ownerId}`);
    joinAppend = "";
  } else {
    // NO filter parameters
    console.log("No filter params");
    joinAppend = getAmbigStatement(specifyFilterBy, owner.ownerColumnName);
    if (owner.ownerId)
      whereStatements.push(`WHERE ${joinAppend}${owner.ownerColumnName} = ${owner.ownerId}`);
    joinAppend = "";
  }

  return whereStatements;
};

module.exports = {
  createSearchQuery,
  getFilterWhereStatement,
  executeQuery,
  queryGenericSearchV2,
  validateFilter,
  validateFilterCondition,
  genericDeleteById,
  createSetStatements,
  createGenericUpdateQuery
};
