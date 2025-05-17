const axios = require('axios');

// scripts/test.test.js

describe('POST /server', () => {
  it('should respond with 200 and return the posted data', async () => {
    const postData = { name: 'John', age: 30 };
    const response = await axios.post('http://localhost:3000/server', postData);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(postData);
  });

  it('should return 400 for invalid data', async () => {
    try {
      await axios.post('http://localhost:3000/server', { invalid: true });
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
});