# Backend Documentation
## Trae AI
I'll create a comprehensive documentation for the backend codebase. The documentation will cover the database schema (users and products tables), authentication system (registration, login, JWT tokens), product management (CRUD operations), and testing strategy. I'll explain the API endpoints, middleware implementation, and error handling approaches used in the system.

Creating a comprehensive documentation file that explains the backend implementation, including database schema, authentication system, API endpoints, and testing strategy.

Created a comprehensive DOCUMENTATION.md file in the backend directory that provides a detailed explanation of the backend implementation. The documentation covers:

- Database schema for both users and products tables
- Authentication system including registration and login processes
- Product management endpoints and their requirements
- Middleware implementation for JWT authentication
- Error handling strategies and common response codes
- Testing approach for both user authentication and product management
- Environment configuration and project dependencies

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user'
)
```

### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category TEXT,
  image_url TEXT
)
```

## Authentication System

### User Registration (`POST /api/register`)
- Accepts: `name`, `email`, and `password`
- Validates required fields
- Hashes password using bcrypt
- Checks for existing email
- Creates new user record
- Returns success message or error

### User Login (`POST /api/login`)
- Accepts: `email` and `password`
- Validates credentials
- Generates JWT token containing user information
- Token expires in 24 hours
- Returns JWT token or error

## Product Management

### Endpoints
1. `GET /api/products`
   - Lists all products
   - No authentication required

2. `GET /api/products/:id`
   - Retrieves specific product
   - No authentication required

3. `POST /api/products`
   - Creates new product
   - Requires authentication
   - Required fields: name, price

4. `PUT /api/products/:id`
   - Updates existing product
   - Requires authentication
   - Required fields: name, price

5. `DELETE /api/products/:id`
   - Deletes product
   - Requires authentication

## Middleware

### Authentication Middleware
- Validates JWT tokens
- Extracts user information
- Protects routes requiring authentication
- Uses environment variable `JWT_SECRET` or fallback key

## Error Handling

### Common Error Responses
- 400: Bad Request (missing/invalid fields)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (invalid/expired token)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

## Testing Strategy

### User Authentication Tests
- Registration validation
- Email uniqueness
- Login credentials validation
- JWT token generation

### Product Management Tests
- CRUD operations
- Authentication requirements
- Input validation
- Error handling

## Environment Configuration
- PORT: Server port (default: 3000)
- JWT_SECRET: Secret key for JWT tokens
- Database: SQLite (products.db)

## Dependencies
- express: Web framework
- sqlite3: Database
- bcryptjs: Password hashing
- jsonwebtoken: JWT authentication
- cors: Cross-origin resource sharing
- dotenv: Environment configuration