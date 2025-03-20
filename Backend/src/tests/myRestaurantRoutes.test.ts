import request from 'supertest';
import app from '..';
import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant';
import Order from '../models/Order';
import User from '../models/User';

// Mock models to isolate the tests
jest.mock('../models/restaurant');
jest.mock('../models/order');
jest.mock('../models/user');

// Clear the mock after all tests
afterAll(() => {
  jest.clearAllMocks();
  mongoose.connection.close();
});

describe('MyRestaurant API Routes', () => {
  beforeAll(async () => {
    // Mock the DB connection (optional, if using a separate test DB)
    await mongoose.connect('mongodb://localhost:27017/testDB');
  });

  describe('GET /order', () => {
    it('should fetch orders for the restaurant', async () => {
      const mockRestaurant = { _id: 'restaurantId', user: 'userId' };
      const mockOrders = [
        { _id: 'orderId1', status: 'pending' },
        { _id: 'orderId2', status: 'completed' },
      ];

      // Mock the database calls
      (Restaurant.findOne as jest.Mock).mockResolvedValue(mockRestaurant);
      (Order.find as jest.Mock).mockResolvedValue(mockOrders);

      const response = await request(app).get('/order').expect(200);

      expect(response.body).toEqual(mockOrders);
    });

    it('should return 404 if restaurant is not found', async () => {
      (Restaurant.findOne as jest.Mock).mockResolvedValue(null); // No restaurant found

      const response = await request(app).get('/order').expect(404);
      expect(response.body.message).toBe('restaurant not found');
    });
  });

  describe('GET /', () => {
    it('should get the restaurant details', async () => {
      const mockRestaurant = { _id: 'restaurantId', user: 'userId', restaurantName: 'Test Restaurant' };

      // Mock the database calls
      (Restaurant.findOne as jest.Mock).mockResolvedValue(mockRestaurant);
      (User.findOne as jest.Mock).mockResolvedValue({ _id: 'userId' });

      const response = await request(app).get('/').expect(200);
      expect(response.body).toEqual(mockRestaurant);
    });

    it('should return 404 if restaurant is not found', async () => {
      (Restaurant.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/').expect(404);
      expect(response.body.message).toBe('restaurant not found');
    });
  });

  describe('POST /', () => {
    it('should create a new restaurant', async () => {
      const newRestaurant = {
        restaurantName: 'New Restaurant',
        city: 'City',
        country: 'Country',
        deliveryPrice: 5,
        estimatedDeliveryTime: 30,
        cuisines: ['Italian'],
        menuItems: [],
        imageId: '12345',
      };

      const mockUser = { _id: 'userId' };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Mock the save method of the Restaurant model
      (Restaurant.prototype.save as jest.Mock).mockResolvedValue(newRestaurant);

      const response = await request(app)
        .post('/')
        .send(newRestaurant)
        .expect(201);

      expect(response.body.restaurantName).toBe('New Restaurant');
    });

    it('should return 500 if there is an error during restaurant creation', async () => {
      (Restaurant.prototype.save as jest.Mock).mockRejectedValue(new Error('DB error'));

      const newRestaurant = {
        restaurantName: 'New Restaurant',
        city: 'City',
        country: 'Country',
        deliveryPrice: 5,
        estimatedDeliveryTime: 30,
        cuisines: ['Italian'],
        menuItems: [],
        imageId: '12345',
      };

      const response = await request(app).post('/').send(newRestaurant).expect(500);
      expect(response.body.message).toBe('Something went wrong');
    });
  });

  describe('PATCH /order/:orderId/status', () => {
    it('should update the order status', async () => {
      const mockOrder = { _id: 'orderId', status: 'pending' };
      const mockRestaurant = { _id: 'restaurantId', user: { _id: 'userId' } };
      const mockUser = { _id: 'userId' };

      // Mock database calls
      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Restaurant.findById as jest.Mock).mockResolvedValue(mockRestaurant);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .patch('/order/orderId/status')
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.status).toBe('completed');
    });

    it('should return 404 if the order is not found', async () => {
      (Order.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .patch('/order/invalidOrderId/status')
        .send({ status: 'completed' })
        .expect(404);

      expect(response.body.message).toBe('order not found');
    });

    it('should return 401 if the user is not authorized to update the order', async () => {
      const mockOrder = { _id: 'orderId', status: 'pending', restaurant: 'restaurantId' };
      const mockRestaurant = { _id: 'restaurantId', user: { _id: 'anotherUserId' } };
      const mockUser = { _id: 'userId' };

      // Mock database calls
      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Restaurant.findById as jest.Mock).mockResolvedValue(mockRestaurant);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .patch('/order/orderId/status')
        .send({ status: 'completed' })
        .expect(401);

      expect(response.body).toBe('');
    });
  });

  describe('PUT /', () => {
    it('should update the restaurant details', async () => {
      const updatedRestaurant = {
        restaurantName: 'Updated Restaurant',
        city: 'New City',
        country: 'New Country',
        deliveryPrice: 7,
        estimatedDeliveryTime: 40,
        cuisines: ['Indian'],
        menuItems: ['Dish 1'],
        imageId: '67890',
      };

      const mockRestaurant = { _id: 'restaurantId', user: 'userId' };

      // Mock database calls
      (Restaurant.findOne as jest.Mock).mockResolvedValue(mockRestaurant);
      (Restaurant.prototype.save as jest.Mock).mockResolvedValue(updatedRestaurant);

      const response = await request(app)
        .put('/')
        .send(updatedRestaurant)
        .expect(200);

      expect(response.body.restaurantName).toBe('Updated Restaurant');
    });

    it('should return 404 if restaurant not found for update', async () => {
      (Restaurant.findOne as jest.Mock).mockResolvedValue(null);

      const updatedRestaurant = {
        restaurantName: 'Updated Restaurant',
        city: 'New City',
        country: 'New Country',
      };

      const response = await request(app).put('/').send(updatedRestaurant).expect(404);
      expect(response.body.message).toBe('restaurant not found');
    });
  });
});
