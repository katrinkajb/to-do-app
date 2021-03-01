const client = require('../lib/client');
// import our seed data:
const animals = require('./animals.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash, display_name)
                      VALUES ($1, $2, $3)
                      RETURNING *;
                  `,
        [user.email, user.hash, user.display_name]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      animals.map(animal => {
        return client.query(`
                    INSERT INTO todos (todo, completed, owner_id)
                    VALUES ($1, $2, $3);
                `,
        [animal.todo, animal.completed, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
