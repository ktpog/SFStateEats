/**
 * These are the STRING representation for the column names in our database to
 * help prevent misspelling
 */
const TableColumnKey = {
  TABLE_NAME: "food",
  FOOD_ID: "food_id",
  MENU_ID: "menu_id",
  NAME: "name",
  PRICE: "price"
};

// ** ADD Food **
// Request URL: http://localhost:3000/food
// Required key-value parameters in info: name, price, menuID
const addFood = async (req, res) => {
  // Check to make sure all required parameters were passed in
  if (req.body.name && req.body.price && req.body.menuID) {
      try {
          // Attempt to insert a new menu to the DB
          const response = await req.DATABASE_CLIENT.query(`
            INSERT INTO ${TableColumnKey.TABLE_NAME} (${TableColumnKey.NAME}, ${TableColumnKey.PRICE}, ${TableColumnKey.MENU_ID})
            VALUES ('${req.body.name}', ${req.body.price}, ${req.body.menuID})
          `);
          console.log(`Successfully added new menu item.`);
          res.send({ message: "Successfully added new menu item."});
      } catch (e) {
          console.log(e);
          console.log("Failed to add new menu item. Database error.");
          res.status(500).send({ error: "Failed to add new menu item. Database error." });
      }
  } else {
      console.log("Failed to add new menu item. Missing parameters.");
      res.status(400).send({ error: "Failed to add new menu item. Missing parameters." });
  }
};

module.exports = {
  addFood
};
