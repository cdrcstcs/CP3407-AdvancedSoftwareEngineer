import request from 'supertest';
import app from '..';
import Order from '../models/Order';
import Restaurant from '../models/Restaurant';
import User from '../models/User';
import mongoose from 'mongoose';

// Mock the Order, User, and Restaurant models to avoid database interaction
jest.mock('../src/models/order');
jest.mock('../src/models/user');
jest.mock('../src/models/restaurant');

// Clear mock calls after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Close mongoose connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Order API Routes', () => {
  beforeAll(async () => {
    // Connect to a test database if necessary
    await mongoose.connect('mongodb://localhost:27017/testDB');
  });

  describe('GET /orders', () => {
    it('should return all orders for the user if found', async () => {
      const mockUser = { _id: 'userId' };
      const mockOrders = [
        { _id: 'orderId1', totalAmount: 100, status: 'placed' },
        { _id: 'orderId2', totalAmount: 200, status: 'placed' },
      ];

      // Mock the database calls
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Order.find as jest.Mock).mockResolvedValue(mockOrders);

      const response = await request(app).get('/orders').expect(200);

      expect(response.body).toEqual(mockOrders);
      expect(response.status).toBe(200);
    });

    it('should return 500 if there is an error fetching orders', async () => {
      // Mock database call to throw an error
      (User.findOne as jest.Mock).mockResolvedValue({ _id: 'userId' });
      (Order.find as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/orders').expect(500);

      expect(response.body.message).toBe('something went wrong');
      expect(response.status).toBe(500);
    });
  });

  describe('POST /orders', () => {
    it('should create a new order successfully', async () => {
      const mockUser = { _id: 'userId' };
      const mockRestaurant = {
        _id: 'restaurantId',
        menuItems: [{ _id: 'menuItemId', price: 20 }],
      };
      const mockOrder = { 
        restaurant: 'restaurantId', 
        user: 'userId', 
        deliveryDetails: { email: 'email', name: 'name', addressLine1: 'address', city: 'city' },
        cartItems: [{ menuItemId: 'menuItemId', quantity: 2, name: 'item' }],
        totalAmount: 40,
        status: 'placed',
      };

      // Mock the database calls
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Restaurant.findById as jest.Mock).mockResolvedValue(mockRestaurant);
      (Order.prototype.save as jest.Mock).mockResolvedValue(mockOrder);

      const response = await request(app)
        .post('/orders')
        .send({
          restaurantId: 'restaurantId',
          deliveryDetails: { email: 'email', name: 'name', addressLine1: 'address', city: 'city' },
          cartItems: [{ menuItemId: 'menuItemId', quantity: 2, name: 'item' }],
        })
        .expect(201);

      expect(response.body.message).toBe('Order created successfully');
      expect(response.body.order).toEqual(mockOrder);
      expect(response.status).toBe(201);
    });

    it('should return 400 for invalid restaurantId', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          restaurantId: 'invalidRestaurantId',
          deliveryDetails: { email: 'email', name: 'name', addressLine1: 'address', city: 'city' },
          cartItems: [{ menuItemId: 'menuItemId', quantity: 2, name: 'item' }],
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid restaurantId');
      expect(response.status).toBe(400);
    });

    it('should return 404 if restaurant is not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ _id: 'userId' });
      (Restaurant.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/orders')
        .send({
          restaurantId: 'restaurantId',
          deliveryDetails: { email: 'email', name: 'name', addressLine1: 'address', city: 'city' },
          cartItems: [{ menuItemId: 'menuItemId', quantity: 2, name: 'item' }],
        })
        .expect(404);

      expect(response.body.message).toBe('Restaurant not found');
      expect(response.status).toBe(404);
    });

    it('should return 404 if menu item is not found', async () => {
      const mockUser = { _id: 'userId' };
      const mockRestaurant = {
        _id: 'restaurantId',
        menuItems: [{ _id: 'menuItemId', price: 20 }],
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Restaurant.findById as jest.Mock).mockResolvedValue(mockRestaurant);

      const response = await request(app)
        .post('/orders')
        .send({
          restaurantId: 'restaurantId',
          deliveryDetails: { email: 'email', name: 'name', addressLine1: 'address', city: 'city' },
          cartItems: [{ menuItemId: 'invalidMenuItemId', quantity: 2, name: 'item' }],
        })
        .expect(404);

      expect(response.body.message).toBe('Menu item not found: invalidMenuItemId');
      expect(response.status).toBe(404);
    });

    it('should return 500 if there is a server error while creating the order', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ _id: 'userId' });
      (Restaurant.findById as jest.Mock).mockResolvedValue({
        _id: 'restaurantId',
        menuItems: [{ _id: 'menuItemId', price: 20 }],
      });
      (Order.prototype.save as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/orders')
        .send({
          restaurantId: 'restaurantId',
          deliveryDetails: { email: 'email', name: 'name', addressLine1: 'address', city: 'city' },
          cartItems: [{ menuItemId: 'menuItemId', quantity: 2, name: 'item' }],
        })
        .expect(500);

      expect(response.body.message).toBe('Something went wrong');
      expect(response.status).toBe(500);
    });
  });
});
