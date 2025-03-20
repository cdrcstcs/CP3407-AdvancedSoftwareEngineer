import mongoose from 'mongoose';
import request from 'supertest';
import app from '../'; // Assuming your express app is exported here

// Mock Mongoose Schema, Types, and model
jest.mock('mongoose', () => {
  const originalMongoose = jest.requireActual('mongoose'); // Keep original Mongoose functionality

  return {
    ...originalMongoose, // Spread the remaining properties of mongoose
    Schema: jest.fn().mockImplementation(function (this: any) {
      this.Types = {
        ObjectId: 'mocked-object-id',  // Mock ObjectId as a string or any value you want
      };
    }),
    model: jest.fn().mockReturnValue({
      findById: jest.fn().mockResolvedValue({ image: 'mocked-image.jpg' }), // Mock findById and create
      create: jest.fn().mockResolvedValue({ image: 'mocked-image.jpg' }),
    }),
    connect: jest.fn().mockResolvedValue('mocked-connection'), // Mock connect
    connection: {
      close: jest.fn(), // Mock close for connection
    },
  };
});

describe('Image Routes', () => {
  beforeAll(() => {
    // Optionally, mock database setup or any pre-test logic
  });

  afterAll(() => {
    // Optionally, clean up after tests or reset mocked connections
  });

  describe('POST /upload', () => {
    it('should upload an image and return the image data', async () => {
      // Simulate uploading an image
      const response = await request(app)
        .post('/upload')
        .attach('file', 'path/to/sample-image.jpg') // Mock image upload
        .expect(200);

      expect(response.body.image).toBeDefined();
      expect(response.body.image).toEqual('mocked-image.jpg');
    });

    it('should return a 400 error if no file is uploaded', async () => {
      const response = await request(app).post('/upload').expect(400);
      expect(response.body.error).toEqual('No file uploaded.');
    });
  });

  describe('GET /:id', () => {
    it('should return an image by its id', async () => {
      // Simulate fetching an image with ID '1'
      const response = await request(app).get('/1');
      expect(response.status).toBe(200);
      expect(response.body.image).toEqual('mocked-image.jpg');
    });

    it('should return 404 if image is not found', async () => {
      const { findById } = require('../models/Image');
      findById.mockResolvedValue(null); // Simulate no image found

      const response = await request(app).get('/invalid-id');
      expect(response.status).toBe(404);
      expect(response.text).toBe('Image not found');
    });
  });
});
