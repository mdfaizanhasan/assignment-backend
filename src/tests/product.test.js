const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const productRoutes = require('../routes/productRoutes');

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

// Mock database functions
jest.mock('../config/database');

describe('Product Management', () => {
  let authToken;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a valid auth token for protected routes
    authToken = jwt.sign(
      { id: 1, name: 'Faizan', email: 'mdfaizanalam367@gmail.com', role: 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 99.99 },
        { id: 2, name: 'Product 2', price: 149.99 },
      ];

      db.all.mockImplementation((query, params, callback) => {
        callback(null, mockProducts);
      });

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
    });

    it('should handle database errors', async () => {
      db.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'));
      });

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Error fetching products');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a specific product', async () => {
      const mockProduct = { id: 1, name: 'Product 1', price: 99.99 };

      db.get.mockImplementation((query, params, callback) => {
        callback(null, mockProduct);
      });

      const response = await request(app).get('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });

    it('should return 404 for non-existent product', async () => {
      db.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).get('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product with valid token', async () => {
      const mockProduct = {
        name: 'New Product',
        description: 'Test description',
        price: 99.99,
        category: 'Test',
      };

      db.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockProduct);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(mockProduct);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ name: 'Test Product', price: 99.99 });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Test description' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Name and price are required'
      );
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product with valid token', async () => {
      const mockProduct = {
        name: 'Updated Product',
        description: 'Updated description',
        price: 149.99,
        category: 'Updated',
      };

      db.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const response = await request(app)
        .put('/api/products/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockProduct);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ id: '1', ...mockProduct });
    });

    it('should return 404 for non-existent product', async () => {
      db.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const response = await request(app)
        .put('/api/products/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Product', price: 99.99 });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product with valid token', async () => {
      db.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const response = await request(app)
        .delete('/api/products/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Product deleted successfully'
      );
    });

    it('should return 404 for non-existent product', async () => {
      db.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const response = await request(app)
        .delete('/api/products/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });
});
