/**
 * These are the STRING representation for the column names in our database to
 * help prevent misspelling
 */
const TableColumnKey = {
    TABLE_NAME: "menu",
    MENU_ID: "menu_id",
    NAME: "name",
    RESTAURANT_ID: "restaurant_id"
};

// ** GET MENU BY RESTAURANT ID **
// Request URL: http://localhost:3000/menu/42
// req.params: {"restaurantId": "42"}
const getFoodInMenuByRestaurantId = async (req, res) => {
    try {
        const response = await req.DATABASE_CLIENT.query(`
          SELECT menu.name AS "Menu Name", food.name AS "Food Name", food.price AS "Price" FROM ${TableColumnKey.TABLE_NAME}
          JOIN food ON food.menu_id = menu.menu_id
          WHERE menu.restaurant_id = ${req.params.restaurantId}
        `);
        const emptyMenus = await req.DATABASE_CLIENT.query(`
        SELECT menu.name AS "Menu Name" FROM ${TableColumnKey.TABLE_NAME}
        WHERE menu.restaurant_id = ${req.params.restaurantId}
      `);

        temp = emptyMenus.rows.reduce((acc, menu) => {
            const key = menu["Menu Name"];
            acc[key]= [];
            return acc;
        }, {});

        temp = (response.rows).reduce((acc, value) => {
            const key = value["Menu Name"];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(value);
            return acc;
        }, temp)
        res.send({ menus: temp });
        console.log("Got menu with matching restaurant ID.");
    } catch (e) {
        console.log(e);
        console.log("Failed to get menu with specific restaurant ID.");
        res.status(500).send({ error: "Failed to get menu with specific restaurant ID." });
    }
};

// ** ADD MENU **
// Request URL: http://localhost:3000/menu
// Required key-value parameters in info: menuName, restaurantId
const addMenu = async (req, res) => {
    // Check to make sure all required parameters were passed in
    if (req.body.menuName && req.body.restaurantId) {
        try {
            // Attempt to insert a new menu to the DB
            const response = await req.DATABASE_CLIENT.query(`
              INSERT INTO ${TableColumnKey.TABLE_NAME} (${TableColumnKey.NAME}, ${TableColumnKey.RESTAURANT_ID})
              VALUES ('${req.body.menuName}', ${req.body.restaurantId})
              RETURNING ${TableColumnKey.Menu_ID} AS return_id
            `);
            // If insert was successfull, return the ID of the menu that was inserted
            var newlyCreatedMenuId = response.rows[0].return_id;
            console.log(`Successfully added new menu with ID: ${newlyCreatedMenuId}.`);
            res.send({ message: "Successfully registered new account.", menuId: newlyCreatedMenuId });
        } catch (e) {
            console.log(e);
            console.log("Failed to add new menu. Database error.");
            res.status(500).send({ error: "Failed to add new menu. Database error." });
        }
    } else {
        console.log("Failed to add new menu. Missing parameters.");
        res.status(400).send({ error: "Failed to add new menu. Missing parameters." });
    }
};

// ** DELETE MENU BY MENU ID**
// Request URL: * NONE * This function is called internally only!
// req.params: {"restaurantId": "42"}
const deleteMenuByID = async (req, res) => {
    // Check to make sure all required parameters were passed in
    if (req.params.restaurantId) {
      try {
        // Attempt to delete the menu
        const response = await req.DATABASE_CLIENT.query(`
          DELETE FROM ${TableColumnKey.TABLE_NAME}
          WHERE ${TableColumnKey.MENU_ID} = ${req.params.restaurantId}
        `);
        console.log(`Successfully deleted new menu with ID: ${req.param.restaurantId}.`);
        res.send({ message: "Successfully deleted menu."});
      } catch (e) {
        console.log(e);
        console.log("Failed to delete menu. Database error.");
        res.status(500).send({ error: "Failed to delete menu. Database error." });
      }
    } else {
      console.log("Failed to delete menu. Missing parameters.");
      res.status(400).send({ error: "Failed to delete menu. Missing parameters." });
    }
};

module.exports = {
    getFoodInMenuByRestaurantId,
    addMenu,
    deleteMenuByID
}