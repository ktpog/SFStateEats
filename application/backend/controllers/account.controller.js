const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  queryGenericSearchV2,
  executeQuery,
  validateFilter,
  validateFilterCondition,
  genericDeleteById,
  createSetStatements,
  createGenericUpdateQuery
} = require("../helpers/queryCreator");
var jwt = require("jsonwebtoken");
const saltRounds = 10;
const { addUser, deleteUserByID } = require("./user.controller");
const { sendEmailChangePassword } = require("../helpers/mailer");

/**
 * These are the STRING representation for the column names in our database to
 * help prevent misspelling
 */
const TableColumnKey = {
  TABLE_NAME: "account",
  ACCCOUNT_ID: "account_id",
  USER_ID: "users_id",
  USERNAME: "username",
  PASSWORD: "password",
  EMAIL: "email",
  EXPIRED_PASSWORD: "expired_password",
  CHANGE_PASSWORD_HASH: "change_password_hash"
};

// Blacklist these IP address for failed login attempts
const blacklistedIp = {};

// Returns 1 if username is free
// Returns 0 if username is taken
const usernameIsFree = async req => {
  // Query database and see if username is there
  try {
    // Attempt to select any account with the given username
    const response = await req.DATABASE_CLIENT.query(`
        SELECT * FROM ${TableColumnKey.TABLE_NAME}
        WHERE ${TableColumnKey.USERNAME} = '${req.body.username}'
        `);
    if (response.rowCount == 0) return 1;
    else return 0;
  } catch (e) {
    console.log(e);
    console.log("Failed to check if username was taken.");
    return -1;
  }
};

// ** REGISTER AN ACCOUNT **
// Request URL: http://localhost:3000/account/register
// Required key-value parameters in POST body: username, password, name, dob (YYYY-MM-DD), accountType (1- Business Account; 2 - Registered User; 3 - Admin), adminToken (Only if creating admin account)
const registerAccount = async (req, res) => {
  // Check to make sure all required parameters passed in
  if (
    req.body.username &&
    req.body.password &&
    req.body.name &&
    req.body.dob &&
    req.body.accountType
  ) {
    // Verify that password has one uppercase, lowercase, number, and special character
    const specialCharRegex = RegExp(/[~`!#@$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
    const numberRegex = RegExp(/\d/);
    const lowerRegex = RegExp(/[a-z]/);
    const upperRegex = RegExp(/[A-Z]/);
    const alphanumericRegex = RegExp(/[^a-zA-Z0-9]/);

    if (!specialCharRegex.test(req.body.password)) {
      return res.status(400).send({ error: "Password missing special character", code: 3000 });
    } else if (!numberRegex.test(req.body.password)) {
      return res.status(400).send({ error: "Password missing number", code: 3001 });
    } else if (!lowerRegex.test(req.body.password)) {
      return res.status(400).send({ error: "Password missing lower case letter", code: 3002 });
    } else if (!upperRegex.test(req.body.password)) {
      return res.status(400).send({ error: "Password missing upper case letter", code: 3003 });
    }

    if (alphanumericRegex.test(req.body.username)) {
      return res.status(400).send({ error: "Username must only be alphanumerical", code: 3004 });
    }

    if (!isValidEmail(req.body.email)) {
      return res.status(400).send({ error: "Invalid email format", code: 3010 });
    } else if (!isValidEmailDomain(req.body.email)) {
      return res.status(400).send({ error: "Invalid email domain", code: 3011 });
    }

    if (!(req.body.accountType == 1 || req.body.accountType == 2 || req.body.accountType == 3)) {
      return res.status(400).send({ error: "Invalid account type", code: 3012 });
    }

    // If user is trying to create an admin account, make sure they know the admin token
    if (req.body.accountType == 3 && req.body.adminToken != 7326792) {
      return res.status(400).send({ error: "Invalid admin token", code: 3013 });
    }

    // Before we can create an account, we must verify that the username has not been taken
    if ((await usernameIsFree(req)) == 0) {
      console.log("Failed to register new account. Username taken.");
      res.status(400).send({ error: "Failed to register new account. Username taken." });
      return;
    }

    // An account needs a user as a FK. User stores the personal information such as name, dob, and photo
    // First create a user entry in the user table, for this specific account
    var user_id = await addUser(req);

    // Check to make sure user was added successfully
    if (user_id != -1) {
      hashed_password = bcrypt.hashSync(req.body.password, saltRounds);
      try {
        // Attempt to insert account
        const response = await req.DATABASE_CLIENT.query(`
                  INSERT INTO ${TableColumnKey.TABLE_NAME}(${TableColumnKey.USER_ID}, ${TableColumnKey.USERNAME}, ${TableColumnKey.PASSWORD}, ${TableColumnKey.EMAIL}, ${TableColumnKey.EXPIRED_PASSWORD})
                  VALUES (${user_id}, '${req.body.username}', '${hashed_password}', '${req.body.email}', 'false')
                  RETURNING ${TableColumnKey.ACCCOUNT_ID} AS return_id
                `);
        console.log("Successfully registered new account.");
        var newlyCreatedAccountId = response.rows[0].return_id;
        // Since we created the account successfuly, we have to add this account to the proper table
        // This will either be Business Account, Registered User
        if (req.body.accountType == 1) {
          const response = await req.DATABASE_CLIENT.query(`
                  INSERT INTO business_account (account_id)
                  VALUES (${newlyCreatedAccountId})
                `);
        } else if (req.body.accountType == 2) {
          const response = await req.DATABASE_CLIENT.query(`
                  INSERT INTO registered_user (account_id)
                  VALUES (${newlyCreatedAccountId})
                `);
        } else if (req.body.accountType == 3) {
          const response = await req.DATABASE_CLIENT.query(`
                  INSERT INTO admin (account_id)
                  VALUES (${newlyCreatedAccountId})
                `);
        }
        res.send({ message: "Successfully registered new account." });
        return;
      } catch (e) {
        // If account creation was unsuccesfull, we should delete the user we just made as well
        req.body.id = user_id;
        await deleteUserByID(req);
        console.log(e);
        console.log("Failed to register new account.");
        res.status(500).send({ error: "Failed to register new account." });
        return;
      }
    } else {
      console.log("Failed to add new user before account.");
      res.status(500).send({ error: "Failed to add new user before account." });
      return;
    }
  } else {
    console.log("Failed to register new account. Missing Parameters.");
    res.status(400).send({ error: "Failed to register new account. Missing Parameters." });
    return;
  }
};

const getAccounts = async (req, res) => {
  console.log("GET");
  const sqlOptions = {
    table: "Account",
    orderByColumnName: "Users.name", // Will join user later
    databaseClient: req.DATABASE_CLIENT
  };

  const urlParamsObject = req.query;
  const successKey = "Account";
  const errorMessage = "Failed to get accounts";

  const error = validateFilter(urlParamsObject);
  if (error) res.status(400).send(error.error);

  // Make sure the filterCondition is one to one with filterBy if filterCondition field is left empty in the query
  urlParamsObject.filterCondition = validateFilterCondition(urlParamsObject);

  // For easy access to ownerId paramter
  // ownerId is the ownerColumnName which would be ?ownerId=
  const owner = {
    ownerColumnName: "account_id",
    ownerId: urlParamsObject.ownerId
  };

  const joinConfig = {
    joinStatements: ["JOIN Users ON Users.users_id = Account.users_id"],
    // This is used to resolve ambiguos referencs if theres two tables that have the same column name
    // Ex. If review_id is in two tables, which one do we use?
    // Here we will specify which table will use which filterBy query
    specifyFilterBy: {
      Account: ["users_id, account_id"]
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

  let resData = [];

  queryResponse.Account.forEach(data => {
    resData.push({
      account_id: data.account_id,
      name: data.name,
      username: data.username
    });
  });

  console.log(resData);

  res.send(resData);
};

// ** LOGIN AN ACCOUNT **
// Request URL: http://localhost:3000/account/login
// Required key-value parameters in POST body: username, password
const loginAccount = async (req, res) => {
  const ipOfUser =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  console.log(ipOfUser);

  const banDuration = 1 * 60 * 1000; // One minute ban

  if (isStillBanned(banDuration, ipOfUser)) {
    console.log("Still banned");
    return res.send({ error: "User is still banned from failing to log in too much", code: 4000 });
  } else if (shouldBeAbleToLogin(banDuration, ipOfUser)) {
    unbanUser(ipOfUser);
  }

  // Check to make sure all required parameters passed in
  if (req.body.username && req.body.password) {
    // Check to make sure user was added successfully
    try {
      let response = "";
      let accountType = 1; // business
      let accountData = {};

      // Check if its a business owner (joins will work if its a business owner)
      response = await isLoggedInUserBusiness(req, req.body.username);
      if (response) {
        accountData = { ...accountData, business_account_id: response.rows[0].business_account_id };
      }

      // Check if admin instead
      if (!response) {
        accountType = 3;
        response = await isLoggedInUserAdmin(req, req.body.username);
        if (response) accountData = { ...accountData, admin_id: response.rows[0].admin_id };
      }
      // normal user
      else {
        accountType = 2;
      }

      // Normal user query
      response = await req.DATABASE_CLIENT.query(`
            SELECT * FROM ${TableColumnKey.TABLE_NAME}
            WHERE ${TableColumnKey.USERNAME} ILIKE '${req.body.username}'`);
      accountData = { ...accountData, account_id: response.rows[0].account_id };

      console.log(response.rows[0]);

      const user = {
        account_id: response.rows[0].account_id,
        users_id: response.rows[0].users_id,
        username: response.rows[0].username,
        email: response.rows[0].email,
        expired_password: response.rows[0].expired_password,
        accountType: accountType
      };

      console.log(user);

      if (response.rowCount == 0) {
        // If the account does not exist, cannot log in
        // Mark this IP login attempts for possible blacklist later
        if (blacklistedIp[ipOfUser]) {
          blacklistedIp[ipOfUser].attempts = blacklistedIp[ipOfUser].attempts + 1;
        } else {
          blacklistedIp[ipOfUser] = { attempts: 1 };
        }

        console.log(`IP: ${ipOfUser} ... Attempts: ${blacklistedIp[ipOfUser].attempts}`);

        if (isOverAttemptedLogins(5, ipOfUser)) {
          banUser(ipOfUser);
        }

        console.log("Failed to login. Account does not exist.");
        res.status(400).send({ error: "Failed to login. Account does not exist." });
        return;
      } else {
        // If the account does exist, make sure that the password is correct
        var validPassword = bcrypt.compareSync(req.body.password, response.rows[0].password);
        if (validPassword) {
          console.log("Successfully logged in.");
          // Save a signed token to a cookie, so they have correct
          var token = jwt.sign(
            {
              account_id: accountData.account_id,
              business_account_id: accountData.business_account_id,
              admin_id: accountData.admin_id
            },
            "csc648CookiesSecret"
          );
          console.log(accountData);
          console.log(token);

          var decoded = jwt.verify(token, "csc648CookiesSecret");
          console.log("-----------ddd");
          console.log(decoded);
          console.log("-----------ddd");
          res.send({ message: "Successfully logged in.", user: user, Token: token });
          return;
        } else {
          console.log("Failed to log in. Incorrect Password.");
          res.status(400).send({ error: "Failed to log in. Incorrect Password." });
        }
      }
    } catch (e) {
      console.log(e);
      console.log("Failed to log in.");
      res.status(500).send({ error: "Failed to log in." });
    }
  } else {
    console.log("Failed to register new account. Missing Parameters.");
    res.status(400).send({ error: "Failed to register new account. Missing Parameters." });
  }
};

const deleteAccountById = async (req, res) => {
  const isAdmin = req.admin_id ? true : false;

  console.log(isAdmin);

  const config = {
    deleteId: req.params.accountId,
    deleteColumnName: "account_id",
    tableName: "Account",
    errorCodeStartRange: 20000,
    DATABASE_CLIENT: req.DATABASE_CLIENT,
    isAdmin
  };

  const result = await genericDeleteById(config);
  res.send(result);
};

const updateAccountById = async (req, res) => {
  const setStatements = createSetStatements(req.body);

  console.log(setStatements);

  if (setStatements.length <= 0) {
    return res.send({ error: "No parameters", code: 12111 });
  }

  const config = {
    tableName: "Account",
    whereColumnName: "account_id",
    whereColumnValue: req.params.accountId,
    setStatements
  };

  const genericQuery = createGenericUpdateQuery(config);

  const data = await executeQuery(
    req.DATABASE_CLIENT,
    genericQuery,
    "Account",
    `Failed to update account`
  );

  console.log(data);

  if (data.error) {
    res.send({ error: data.error });
  } else {
    res.send({ message: "account updated" });
  }
};

const isLoggedInUserBusiness = async (req, username) => {
  const response = await req.DATABASE_CLIENT.query(`
    SELECT * FROM ${TableColumnKey.TABLE_NAME}
    JOIN business_account ON business_account.account_id = ${TableColumnKey.TABLE_NAME}.account_id
  WHERE ${TableColumnKey.USERNAME} ILIKE '${username}'`);

  if (response.rows.length <= 0) {
    return false;
  }

  return response;
};

const isLoggedInUserAdmin = async (req, username) => {
  const response = await req.DATABASE_CLIENT.query(`
    SELECT * FROM ${TableColumnKey.TABLE_NAME}
    JOIN admin ON admin.account_id = ${TableColumnKey.TABLE_NAME}.account_id
    WHERE ${TableColumnKey.USERNAME} ILIKE '${username}'`);

  console.log(response);

  if (response.rows.length <= 0) {
    return false;
  }

  return response;
};

// When user first clicks on change password, we will first need to
// create hash in the database that will be used to allow them to change their password
const beginChangePassword = async (req, res) => {
  console.log(`User account: ${req.account_id}`);
  console.log(`Admin account: ${req.admin}`);
  console.log(`Business account: ${req.business_account_id}`);
  // 1) Verify they are logged in
  if (!req.account_id) {
    return res.send({ error: "Unauthorized user attempting to change password", code: 6000 });
  }

  // 2) Create hash based on their account information
  const response = await req.DATABASE_CLIENT.query(`
      SELECT * FROM ${TableColumnKey.TABLE_NAME}
      WHERE ${TableColumnKey.ACCCOUNT_ID} = '${req.account_id}'
      `);

  const hash = crypto
    .createHash("sha256")
    .update(`${response.rows[0].username}${response.rows[0].password}${Date.now()}`)
    .digest("hex");

  const userEmail = response.rows[0].email;

  // Store hash in account database
  await req.DATABASE_CLIENT.query(`
      UPDATE ${TableColumnKey.TABLE_NAME}
      SET change_password_hash = '${hash}'
      WHERE ${TableColumnKey.ACCCOUNT_ID} = '${req.account_id}'
      `);

  // 3) Create URL for that hash to send to the users email
  // This should be a frontend ROUTE not a /api route
  const url = `http://3.12.102.223/:4000/endChangePassword?hash=${hash}`;
  await sendEmailChangePassword(userEmail, url);

  res.send({ message: "Successfully sent email to user" });
};

const endChangePassword = async (req, res) => {
  console.log(req.query);
  if (!req.query && !req.query.hash) {
    return res.status(400).send({ error: "Missing hash in parameters", code: 6677 });
  } else if (!req.query.password) {
    return res.status(400).send({ error: "Missing password in parameters", code: 6679 });
  }

  // Verify that password has one uppercase, lowercase, number, and special character
  const specialCharRegex = RegExp(/[~`!#@$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
  const numberRegex = RegExp(/\d/);
  const lowerRegex = RegExp(/[a-z]/);
  const upperRegex = RegExp(/[A-Z]/);
  const alphanumericRegex = RegExp(/[^a-zA-Z0-9]/);

  if (!specialCharRegex.test(req.query.password)) {
    return res.status(400).send({ error: "Password missing special character", code: 3000 });
  } else if (!numberRegex.test(req.query.password)) {
    return res.status(400).send({ error: "Password missing number", code: 3001 });
  } else if (!lowerRegex.test(req.query.password)) {
    return res.status(400).send({ error: "Password missing lower case letter", code: 3002 });
  } else if (!upperRegex.test(req.query.password)) {
    return res.status(400).send({ error: "Password missing upper case letter", code: 3003 });
  }

  const response = await req.DATABASE_CLIENT.query(`
  SELECT account_id FROM ${TableColumnKey.TABLE_NAME}
  WHERE ${TableColumnKey.CHANGE_PASSWORD_HASH} = '${req.query.hash}'
  `);

  console.log(response.rows);

  if (response.rows.length <= 0) {
    return res.status(400).send({ error: "Invalid hash", code: 6678 });
  }

  const hashed_password = bcrypt.hashSync(req.query.password, saltRounds);
  try {
    await req.DATABASE_CLIENT.query(`
    UPDATE ${TableColumnKey.TABLE_NAME}
    SET password = '${hashed_password}'
    WHERE ${TableColumnKey.ACCCOUNT_ID} = '${response.rows[0].account_id}'
    `);
  } catch (e) {
    return res.send({ error: "Failed to change password" });
    console.log(e);
  }

  res.send({ message: "Password successfully changed" });
};

// Login restriction helpers
const unbanUser = ip => {
  delete blacklistedIp[ip];
};

const banUser = ip => {
  console.log("banning user: ", blacklistedIp[ip].attempts);
  blacklistedIp[ip].lastBanDate = Date.now();
};

const shouldBeAbleToLogin = (durationOfBan, ip) => {
  return blacklistedIp[ip] && Date.now() - blacklistedIp[ip].lastBanDate >= durationOfBan;
};

const isStillBanned = (durationOfBan, ip) => {
  return blacklistedIp[ip] && Date.now() - blacklistedIp[ip].lastBanDate < durationOfBan;
};

const isOverAttemptedLogins = (numberOfAttemptedLogins, ip) => {
  return blacklistedIp[ip].attempts && blacklistedIp[ip].attempts > numberOfAttemptedLogins;
};

const isValidEmail = email => {
  const emailExpression = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  const emailRegex = RegExp(emailExpression);
  return emailRegex.test(email);
};

const isValidEmailDomain = email => {
  const domainExpression = /@hotmail|@gmail|@outlook|@pepipost|@yahoo/;
  const domainRegex = RegExp(domainExpression);
  return domainRegex.test(email);
};

module.exports = {
  registerAccount,
  loginAccount,
  beginChangePassword,
  endChangePassword,
  deleteAccountById,
  updateAccountById,
  getAccounts
};
