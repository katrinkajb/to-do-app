require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'bob@loblaw.com',
          password: 'lawblog'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('creates a new todo for owner 3', async() => {
      const newTodo = {
        'todo': 'wash the car',
        'completed': false,
        'owner_id': 3
      };

      const dbTodo = [
        {
          ...newTodo,
          id: 7,
        }
      ];

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(dbTodo);
    });
    
    test('returns todos for owner 3', async() => {

      const userTodos = [
        {
          'id': 7,
          'todo': 'wash the car',
          'completed': false,
          'owner_id': 3
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(userTodos);
    });

    test.skip('updates a todo to completed: true', async() => {

      const updatedTodo = {
        'todo': 'wash the car',
        'completed': true,
        'owner_id': 3
      };

      await fakeRequest(app)
        .put('/api/todos/7')
        .send(updatedTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/);
      // .expect(200);
      
      const newData = await fakeRequest(app)
        .get('/api/todos/7')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(newData.body).toEqual(updatedTodo);
    });

  });
});
