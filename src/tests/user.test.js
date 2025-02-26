const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const userRoutes = require('../routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/api', userRoutes);

// Mock database functions
jest.mock('../config/database');

describe('User Authentication', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        name: 'Faizan',
        email: 'mdfaizanalam367@gmail.com',
        password: 'password123',
      };

      db.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      const response = await request(app).post('/api/register').send(mockUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        'message',
        'User created successfully'
      );
      expect(db.run).toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/register').send(mockUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Name, email and password are required'
      );
    });

    it('should return 400 if email already exists', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      db.run.mockImplementation((query, params, callback) => {
        callback({ message: 'UNIQUE constraint failed: users.email' });
      });

      const response = await request(app).post('/api/register').send(mockUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email already exists');
    });
  });

  describe('POST /api/login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
      };

      db.get.mockImplementation((query, params, callback) => {
        callback(null, mockUser);
      });

      const response = await request(app).post('/api/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(
        jwt.verify(
          response.body.token,
          process.env.JWT_SECRET || 'your-secret-key'
        )
      ).toMatchObject({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should return 400 if email or password is missing', async () => {
      const response = await request(app).post('/api/login').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Email and password are required'
      );
    });

    it('should return 401 for invalid credentials', async () => {
      db.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).post('/api/login').send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});
