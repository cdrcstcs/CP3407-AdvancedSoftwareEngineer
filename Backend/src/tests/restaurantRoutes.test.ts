import request from 'supertest';
import app from '..';
import Restaurant from '../models/Restaurant';
import mongoose from 'mongoose';

// Mock the Restaurant model to avoid interacting with the database
jest.mock('../src/models/restaurant');

// Clear mock calls after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Close mongoose connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Restaurant API Routes', () => {
  describe('GET /:restaurantId', () => {
    it('should return the restaurant if found', async () => {
      const mockRestaurant = { _id: 'restaurantId', restaurantName: 'Test Restaurant' };

      // Mock the database call to find the restaurant by ID
      (Restaurant.findById as jest.Mock).mockResolvedValue(mockRestaurant);

      const response = await request(app).get('/restaurants/restaurantId').expect(200);

      expect(response.body).toEqual(mockRestaurant);
      expect(response.status).toBe(200);
    });

    it('should return 404 if restaurant is not found', async () => {
      (Restaurant.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/restaurants/restaurantId').expect(404);

      expect(response.body.message).toBe('restaurant not found');
      expect(response.status).toBe(404);
    });

    it('should return 500 if there is a server error', async () => {
      (Restaurant.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/restaurants/restaurantId').expect(500);

      expect(response.body.message).toBe('something went wrong');
      expect(response.status).toBe(500);
    });
  });

  describe('GET /search/:city', () => {
    it('should return a list of restaurants based on search parameters', async () => {
      const mockRestaurants = [
        { _id: 'restaurantId1', restaurantName: 'Test Restaurant 1', city: 'Test City' },
        { _id: 'restaurantId2', restaurantName: 'Test Restaurant 2', city: 'Test City' },
      ];
      const mockTotalCount = 2;

      // Mock the database call to search restaurants by city
      (Restaurant.countDocuments as jest.Mock).mockResolvedValue(mockTotalCount);
      (Restaurant.find as jest.Mock).mockResolvedValue(mockRestaurants);

      const response = await request(app)
        .get('/restaurants/search/Test City')
        .query({ searchQuery: 'Test', selectedCuisines: 'Italian,Chinese', sortOption: 'lastUpdated', page: 1 })
        .expect(200);

      expect(response.body.data).toEqual(mockRestaurants);
      expect(response.body.pagination.total).toBe(mockTotalCount);
      expect(response.body.pagination.page).toBe(1);
      expect(response.status).toBe(200);
    });

    it('should return an empty list and 404 if no restaurants found', async () => {
      (Restaurant.countDocuments as jest.Mock).mockResolvedValue(0);
      (Restaurant.find as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/restaurants/search/Test City')
        .query({ searchQuery: 'NonExistent', selectedCuisines: '', sortOption: 'lastUpdated', page: 1 })
        .expect(404);

      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
      expect(response.body.pagination.page).toBe(1);
      expect(response.status).toBe(404);
    });

    it('should return 500 if there is a server error', async () => {
      (Restaurant.countDocuments as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/restaurants/search/Test City')
        .query({ searchQuery: 'Test', selectedCuisines: 'Italian', sortOption: 'lastUpdated', page: 1 })
        .expect(500);

      expect(response.body.message).toBe('Something went wrong');
      expect(response.status).toBe(500);
    });
  });
});
