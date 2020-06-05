const { Client } = require("pg");
const client = new Client({
  host: "3.12.102.223",
  port: 5432,
  user: "postgres",
  password: "lakecakebake101",
  database: "sfsu"
});

const test = async () => {
  // CONNECT TO DATABASE
  try {
    await client.connect();
  } catch (e) {
    console.log(e);
  }

  console.log("connected");

  // const query = `
  //   ALTER TABLE Restaurant
  //   ADD COLUMN health_score INTEGER NOT NULL DEFAULT 0
  // `;

  // const query = `SET timezone = 'America/Los_Angeles'`;

  // const query = `
  //     ALTER TABLE Restaurant
  //     ADD COLUMN expired TIMESTAMPTZ
  //   `;

  // const query = `
  //   ALTER TABLE Restaurant
  //   DROP COLUMN expired
  // `;

  // const query1 = `
  //     ALTER TABLE Business_Account
  //     ADD COLUMN restaurant_id integer REFERENCES Restaurant on delete cascade on update cascade
  //   `;

  //   const query = `
  //       ALTER TABLE Restaurant
  //       ADD COLUMN open_hours VARCHAR(100) NOT NULL DEFAULT 'closed'
  //     `;

  //   const query = `
  //        ALTER TABLE Restaurant
  //        ADD COLUMN tags VARCHAR(100)[]
  //      `;

  //   const query = `
  //     CREATE TABLE Review (
  //         review_id serial PRIMARY KEY,
  //         restaurant_id integer REFERENCES Restaurant,
  //         name VARCHAR(255) NOT NULL,
  //         description VARCHAR(300) NOT NULL,
  //         stars SMALLINT NOT NULL
  //     )
  //   `;

  //   const query = {
  //     text:
  //       'INSERT INTO Review(restaurant_id, name, description, stars) VALUES($1, $2, $3, $4)',
  //     values: [1, 'Pretty bad', 'Why eat here when I can eat at home', 2],
  //   };

  //   const query = {
  //     text:
  //       'INSERT INTO Review(restaurant_id, name, description, stars) VALUES($1, $2, $3, $4)',
  //     values: [2, 'Oh yes', 'Would definitely eat here again', 4],
  //   };

  //   const query = {
  //     text:
  //       'INSERT INTO Review(restaurant_id, name, description, stars) VALUES($1, $2, $3, $4)',
  //     values: [
  //       2,
  //       'Man they need new chairs',
  //       'The chair broke when I sat on it',
  //       1,
  //     ],
  //   };

  // try {
  //   await client.query(query);
  //   console.log("success");
  // } catch (e) {
  //   console.log(e.stack);
  //   console.log("failed");
  // }

  //   await selectAllRestaurantQuery();

  // CREATE TABLE
  // try {
  //   const response = await client.query(
  //     'CREATE TABLE user (user_id serisl PRIMARY KEY, name VARCHAR(100) NOT NULL)',
  //   );
  //   console.log(response);
  // } catch (e) {
  //   console.log(e.stack);
  // }

  //   try {
  //       // INSERT DATA
  //     const query = {
  //       text: 'INSERT INTO anotherTest(name) VALUES($1)',
  //       values: ['brianc'],
  //     };
  //     const response = await client.query(query);
  //     console.log('query done..row modified: ' + response.rowCount);
  //     console.log(response);

  //     // SELECT
  //     const response = await client.query('SELECT * FROM anotherTest');
  //     console.log(response.rows);
  //   } catch (e) {
  //     console.log(e.stack);
  //   }

  // try {
  //   const text = `CREATE TABLE Account(
  //             account_id serial PRIMARY KEY NOT NULL,
  //             users_id INTEGER NOT NULL,
  //             username VARCHAR(255) NOT NULL,
  //             password VARCHAR(255) NOT NULL,
  //             FOREIGN KEY (users_id) REFERENCES Users(users_id) on delete cascade on update cascade
  //           )`;
  //   const query = {
  //     text
  //   };
  //   const response = await client.query(query);
  //   console.log(response);
  // } catch (e) {
  //   console.log(e.stack);
  // }

  // try {
  //   const text = `CREATE TABLE Menu(
  //             menu_id serial PRIMARY KEY,
  //             food_id INTEGER NOT NULL,
  //             FOREIGN KEY (food_id) REFERENCES Food(food_id) on update cascade
  //           )`;
  //   const query = {
  //     text
  //   };
  //   const response = await client.query(query);
  //   console.log("done");
  // } catch (e) {
  //   console.log(e.stack);
  // }

  // try {
  //   const text = `CREATE TABLE Food(
  //             food_id serial PRIMARY KEY,
  //             name VARCHAR(255) NOT NULL
  //           )`;
  //   const query = {
  //     text
  //   };
  //   const response = await client.query(query);
  //   console.log("done");
  // } catch (e) {
  //   console.log(e.stack);
  // }

  //const query1 = `ALTER TABLE Business_Account ADD CONSTRAINT Business_Account_Restaurant_FK foreign_key ()`;
  // const query = `ALTER TABLE Review ADD CONSTRAINT Review_Account_FK foreign key (reviewer_id) references Account(accounts_id) on delete cascade`;

  //   const url =
  //     'https://ca-times.brightspotcdn.com/dims4/default/3f6a75d/2147483647/strip/true/crop/6000x4000+0+0/resize/1486x991!/quality/90/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fde%2F72%2F641e50af4dab8641768cb5324ee7%2Frare-society-main-dining-room.jpg';

  //   const r1 = createRestaurantQuery('Mc Donald', 'This place is mc donald', url);
  //   const r2 = createRestaurantQuery('Burger King', 'This is burger king', url);
  //   const r3 = createRestaurantQuery('Denny', 'This is denny', url);
  //   const r4 = createRestaurantQuery('Bedrock', 'This place is bedrock', url);
  //   const r5 = createRestaurantQuery('Churro', 'This place is churro', url);
  //   const r6 = createRestaurantQuery('Lengo', 'This place is lengo', url);

  // const query = `
  //       ALTER TABLE Food
  //       ADD COLUMN price INTEGER NOT NULL
  //     `;

  try {
    const response = await client.query(query);
    console.log("done");
  } catch (e) {
    console.log(e.stack);
  }
};

// function createRestaurantQuery(name, description, photo) {
//   const query = {
//     text: 'INSERT INTO Restaurant(name, description, photo) VALUES($1, $2, $3)',
//     values: [name, description, photo],
//   };
//   return query;
// }

// const selectAllRestaurantQuery = async () => {
//   try {
//     // SELECT
//     const response = await client.query('SELECT * FROM Restaurant');
//     console.log(response.rows);
//   } catch (e) {
//     console.log(e.stack);
//   }
// };

test();
