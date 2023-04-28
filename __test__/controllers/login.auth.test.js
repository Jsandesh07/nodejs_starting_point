const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDynamoClient } = require('../../config/dynamoClient');
const { register, login } = require('../../controllers/authController');
const dynamoClient = getDynamoClient();

// describe('login', () => {
//   let req, res;
//   beforeEach(() => {
//     req = {
//       body: {},
//     };
//     res = {
//       status: jest.fn(() => res),
//       json: jest.fn(() => res),
//       cookie: jest.fn(() => res),
//     };
//   });
//   //   afterEach(() => {
//   //     jest.clearAllMocks();
//   //   });
//   //   afterAll(() => {
//   //     dynamoClient = null;
//   //   });
//   it('should return 400 status code if email or password is missing', async () => {
//     req.body.email = '';
//     req.body.password = '';
//     await login(req, res);
//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({
//       message: 'Please enter all the details',
//     });
//   });

//   it('should return 401 status code if user does not exist', async () => {
//     jest.spyOn(dynamoClient, 'get').mockImplementation((params, callback) => {
//       callback(null, { Item: null });
//     });
//     req.body.email = 'non-existent@example.com';
//     req.body.password = 'password';
//     await login(req, res);
//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: 'User does not exist!!',
//     });
//   });

//   it('should return 401 status code if password is incorrect', async () => {
//     const email = 'existing@example.com';
//     const password = 'correctpassword';
//     jest.spyOn(dynamoClient, 'get').mockImplementation((params, callback) => {
//       callback(null, { Item: { Password: 'encryptedPassword' } });
//     });
//     req.body.email = email;
//     req.body.password = 'wrongpassword';
//     await login(req, res);
//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//       message: 'email or password is not valid',
//     });
//   });

//   it('should return 200 status code if login is successful', async () => {
//     const email = 'test@example.com';
//     const password = 'testPassword';
//     const accessToken = 'mockAccessToken';
//     const user = {
//       Firstname: 'John',
//       Lastname: 'Doe',
//       Email: email,
//       Password: await bcrypt.hash(password, 10),
//     };
//     jest.spyOn(dynamoClient, 'get').mockImplementation((params, callback) => {
//       callback(null, { Item: user });
//     });
//     req.body.email = email;
//     req.body.password = password;
//     await login(req, res);
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       message: 'logged in successfully!!',
//       accessToken: expect.any(String),
//     });
//   });
//   it('should return a 500 error if there is an internal server error', async () => {
//     const email = 'test@example.com';
//     const password = 'testPassword';
//     const mockError = new Error('Something went wrong');
//     jest.spyOn(bcrypt, 'compare').mockRejectedValue(mockError);
//     jest.spyOn(console, 'error').mockImplementation(() => {});
//     req.body.email = email;
//     req.body.password = password;
//     await login(req, res);
//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: 'Internal server error',
//     });
//   });
// });

jest.mock('../../config/dynamoClient'); // Mock the getDynamoClient function
describe('login', () => {
  it('should return 400 if email or password is not provided', async () => {
    const req = {
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Please enter all the details',
    });
  });

  it('should return 401 if user does not exist', async () => {
    const req = {
      body: {
        email: 'nonexistent@example.com',
        password: 'password',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    getDynamoClient.mockResolvedValueOnce({
      get: jest.fn().mockImplementation((params, callback) => {
        callback(null, { Item: null });
      }),
    });
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User does not exist!!',
    });
  });

  it('should return 401 if password is incorrect', async () => {
    const req = {
      body: {
        email: 'existing@example.com',
        password: 'wrongpassword',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      Firstname: 'John',
      Lastname: 'Doe',
      Email: 'existing@example.com',
      Password: await bcrypt.hash('correctpassword', 10),
    };
    getDynamoClient.mockResolvedValueOnce({
      get: jest.fn().mockImplementation((params, callback) => {
        callback(null, { Item: user });
      }),
    });
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'email or password is not valid',
    });
  });

  it('should return an access token if login is successful', async () => {
    const req = {
      body: {
        email: 'existing@example.com',
        password: 'correctpassword',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      Firstname: 'John',
      Lastname: 'Doe',
      Email: 'existing@example.com',
      Password: await bcrypt.hash('correctpassword', 10),
    };
    getDynamoClient.mockResolvedValueOnce({
      get: jest.fn().mockImplementation((params, callback) => {
        callback(null, { Item: user });
      }),
    });
    jwt.sign = jest.fn().mockReturnValueOnce('access_token');
    process.env.SECRET_KEY = 'test_secret_key';
    process.env.JWT_EXPIRE = '1h';
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'logged in successfully!!',
      accessToken: 'access_token',
    });
  });

  it('should return 500 if there is an error', async () => {
    const req = {
      body: {
        email: 'existing@example.com',
        password: 'correctpassword',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    getDynamoClient.mockRejectedValueOnce(new Error('Internal server error'));
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
    });
  });
});
