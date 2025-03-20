import request from 'supertest';
import app from '..';
import User from '../models/User';
import mongoose from 'mongoose';

// Mock the User model to avoid database interaction
jest.mock('../models/user');

// Clear mock calls after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Close mongoose connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('MyUser API Routes', () => {
  beforeAll(async () => {
    // Connect to a test database if necessary
    await mongoose.connect('mongodb://localhost:27017/testDB');
  });

  describe('GET /', () => {
    it('should return the current user if found', async () => {
      // Mock the User.findOne method to return a mock user
      const mockUser = { _id: 'userId', name: 'John Doe', email: 'john@example.com' };
      
      // Ensure User.findOne is mocked correctly
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get('/').expect(200);

      // Assert that the response is the mock user
      expect(response.body).toEqual(mockUser);
      expect(response.status).toBe(200);
    });

    it('should return 404 if the user is not found', async () => {
      // Mock the User.findOne method to return null (user not found)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/').expect(404);

      // Assert that the response contains the correct error message
      expect(response.body.message).toBe('User not found');
      expect(response.status).toBe(404);
    });

    it('should return 500 if there is an error fetching the user', async () => {
      // Mock the User.findOne method to throw an error
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/').expect(500);

      // Assert that the response contains the correct error message
      expect(response.body.message).toBe('Something went wrong');
      expect(response.status).toBe(500);
    });
  });
});
