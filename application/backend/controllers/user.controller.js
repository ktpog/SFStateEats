/**
 * These are the STRING representation for the column names in our database to
 * help prevent misspelling
 */
const TableColumnKey = {
  TABLE_NAME: "users",
  ID: "users_id",
  NAME: "name",
  DOB: "dob",
  AGE: "age",
  PHOTO: "photo"
};

// ** GET ALL USERS **
// Request URL: http://localhost:3000/user
const getAllUsers = async (req, res) => {
  try {
    const response = await req.DATABASE_CLIENT.query(`
        SELECT * FROM ${TableColumnKey.TABLE_NAME}
      `);
    res.send({ user: response.rows });
    console.log("Got all users.");
  } catch (e) {
    console.log(e);
    console.log("Failed to get all users.");
    res.status(500).send({ error: "Failed to get all users." });
  }
};

// ** GET USER BY ID **
// Request URL: http://localhost:3000/user/42
// req.params: {"userId": "42"}
const getUserById = async (req, res) => {
  try {
    const response = await req.DATABASE_CLIENT.query(`
        SELECT * FROM ${TableColumnKey.TABLE_NAME}
        WHERE ${TableColumnKey.ID} = ${req.params.userId}
      `);
    res.send({ user: response.rows });
    console.log("Got user with matching ID.");
  } catch (e) {
    console.log(e);
    console.log("Failed to get user with specific ID.");
    res.status(500).send({ error: "Failed to get user with specific ID." });
  }
};

// ** GET USER BY NAME **
// Request URL: http://localhost:3000/user/Jose
// req.params: {"name": "Jose"}
// If you want to search first and last name, use '-' to seperate names, instead of spaces
const getUserByName = async (req, res) => {
  // Replace all '-' in URL with spaces, so that we can search first and last name at the same time
  req.params.name = req.params.name.replace(/-/g, " ");
  try {
    const response = await req.DATABASE_CLIENT.query(`
        SELECT * FROM ${TableColumnKey.TABLE_NAME}
        WHERE ${TableColumnKey.NAME} = '${req.params.name}'
      `);
    res.send({ user: response.rows });
    console.log("Got user with matching name.");
  } catch (e) {
    console.log(e);
    console.log("Failed to get user with specific name.");
    res.status(500).send({ error: "Failed to get user with specific name." });
  }
};

// ** ADD USER **
// Request URL: * NONE * This function is called internally only!
// Required key-value parameters in info: name, dob
// Returns the user ID of the inserted user
const addUser = async req => {
  // Check to make sure all required parameters were passed in
  if (req.body.name && req.body.dob) {
    // Calculate age from dob
    const age = Math.floor((new Date() - new Date(req.body.dob).getTime()) / 3.15576e10);
    try {
      // Attempt to insert a new user to the DB
      const response = await req.DATABASE_CLIENT.query(`
            INSERT INTO ${TableColumnKey.TABLE_NAME} (${TableColumnKey.NAME}, ${TableColumnKey.DOB}, ${TableColumnKey.AGE})
            VALUES ('${req.body.name}', '${req.body.dob}', ${age})
            RETURNING ${TableColumnKey.ID} AS return_id
          `);
      // If insert was successfull, return the ID of the user that was inserted
      var newlyCreatedUserId = response.rows[0].return_id;
      console.log(`Successfully added new user with ID: ${newlyCreatedUserId}.`);
      return newlyCreatedUserId;
    } catch (e) {
      console.log(e);
      console.log("Failed to add new user. Database error.");
      return -1;
    }
  } else {
    console.log("Failed to add new user. Missing parameters.");
    return -1;
  }
};

// ** DELETE USER BY ID**
// Request URL: * NONE * This function is called internally only!
// Required key-value parameters in info: id
const deleteUserByID = async req => {
  // Check to make sure all required parameters were passed in
  if (req.body.id) {
    try {
      // Attempt to delete the user
      const response = await req.DATABASE_CLIENT.query(`
        DELETE FROM ${TableColumnKey.TABLE_NAME}
        WHERE ${TableColumnKey.ID} = ${req.body.id}
      `);
      console.log(`Successfully deleted new user with ID: ${req.body.id}.`);
    } catch (e) {
      console.log(e);
      console.log("Failed to delete user. Database error.");
      return;
    }
  } else {
    console.log("Failed to delete user. Missing parameters.");
    return;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByName,
  addUser,
  deleteUserByID
};
