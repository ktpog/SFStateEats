const { Client } = require('pg');
const client = new Client({
  host: '3.12.102.223',
  port: 5432,
  user: 'postgres',
  password: 'lakecakebake101',
  database: 'sfsu',
});

const test = async () => {
  // CONNECT TO DATABASE
  try {
    await client.connect();
  } catch (e) {
    console.log(e);
  }

  console.log('connected');

  await selectAllRestaurantQuery();

  // CREATE TABLE
  // try {
  //   const response = await client.query(
  //     'CREATE TABLE anotherTest (name VARCHAR(100) NOT NULL)',
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

  //   try {
  //     const text = `CREATE TABLE Restaurant(
  //           restaurant_id serial PRIMARY KEY,
  //           name VARCHAR(255) NOT NULL UNIQUE,
  //           description VARCHAR(255) NOT NULL,
  //           photo VARCHAR(1000)
  //           )`;
  //     const query = {
  //       text,
  //     };
  //     const response = await client.query(query);
  //     console.log(response);
  //   } catch (e) {
  //     console.log(e.stack);
  //   }

  // const query1 = `ALTER TABLE Restaurant ADD CONSTRAINT Unique_Name UNIQUE (name)`;

  //   const url =
  //     'https://ca-times.brightspotcdn.com/dims4/default/3f6a75d/2147483647/strip/true/crop/6000x4000+0+0/resize/1486x991!/quality/90/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fde%2F72%2F641e50af4dab8641768cb5324ee7%2Frare-society-main-dining-room.jpg';

  //   const r1 = createRestaurantQuery('Mc Donald', 'This place is mc donald', url);
  //   const r2 = createRestaurantQuery('Burger King', 'This is burger king', url);
  //   const r3 = createRestaurantQuery('Denny', 'This is denny', url);
  //   const r4 = createRestaurantQuery('Bedrock', 'This place is bedrock', url);
  //   const r5 = createRestaurantQuery('Churro', 'This place is churro', url);
  //   const r6 = createRestaurantQuery('Lengo', 'This place is lengo', url);

  //   try {
  //     const response = await client.query(r6);
  //     console.log(response);
  //   } catch (e) {
  //     console.log(e.stack);
  //   }
};

function createRestaurantQuery(name, description, photo) {
  const query = {
    text: 'INSERT INTO Restaurant(name, description, photo) VALUES($1, $2, $3)',
    values: [name, description, photo],
  };
  return query;
}

const selectAllRestaurantQuery = async () => {
  try {
    // SELECT
    const response = await client.query('SELECT * FROM Restaurant');
    console.log(response.rows);
  } catch (e) {
    console.log(e.stack);
  }
};

test();
