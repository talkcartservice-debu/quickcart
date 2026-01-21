# QuickCart - Project Structure Documentation

## Overview
This document outlines the complete separation of frontend and backend in the QuickCart e-commerce platform.

## Directory Structure

```
quick-cart/                     # Root monorepo
├── frontend/                   # Next.js Frontend Application
│   ├── app/                   # App Router pages
│   │   ├── add-address/      # Address management
│   │   ├── all-products/     # Product listing
│   │   ├── cart/            # Shopping cart
│   │   ├── my-orders/       # User order history
│   │   ├── order-placed/    # Order confirmation
│   │   ├── product/[id]/    # Product details
│   │   └── seller/          # Seller dashboard
│   ├── assets/              # Images and static assets
│   ├── components/          # React UI components
│   │   ├── seller/         # Seller-specific components
│   │   └── ...             # Shared components
│   ├── context/            # Global state management
│   ├── lib/                # Utility functions
│   ├── public/             # Public static files
│   ├── services/           # API service layer
│   ├── package.json        # Frontend dependencies
│   └── ...                 # Config files
├── backend/                 # Node.js Backend API
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── userController.js
│   │   ├── orderController.js
│   │   └── addressController.js
│   ├── models/            # Database models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Address.js
│   ├── routes/           # API route definitions
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── users.js
│   │   ├── orders.js
│   │   └── addresses.js
│   ├── middleware/       # Authentication middleware
│   ├── config/          # Configuration files
│   ├── utils/           # Helper functions
│   ├── index.js         # Main server entry point
│   ├── seeder.js        # Database seeding script
│   ├── package.json     # Backend dependencies
│   └── ...              # Config files
├── package.json         # Monorepo root configuration
├── README.md           # Project documentation
└── .gitignore         # Git ignore rules
```

## Key Separations

### 1. **Frontend Responsibilities**
- User interface and experience
- Client-side state management
- API communication layer
- Component rendering and routing
- Static asset serving

### 2. **Backend Responsibilities**
- Database operations
- Business logic implementation
- Authentication and authorization
- API endpoint handling
- Data validation and security

### 3. **Communication Layer**
- RESTful API endpoints
- JSON data exchange
- JWT token authentication
- CORS configuration

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)
- `DELETE /api/products/:id` - Delete product (seller)

### Users & Cart
- `GET /api/users/cart` - Get user cart
- `POST /api/users/cart` - Add to cart
- `PUT /api/users/cart/:productId` - Update cart item
- `DELETE /api/users/cart/:productId` - Remove from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/seller/orders` - Get seller orders

### Addresses
- `GET /api/addresses` - Get user addresses
- `POST /api/addresses` - Add new address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

## Environment Configuration

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CURRENCY=$
```

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/quickcart
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Development Commands

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Seed database with sample data
npm run seed

# Build for production
npm run build
```

## Benefits of This Structure

1. **Clear Separation of Concerns** - Frontend handles UI, backend handles data
2. **Independent Development** - Teams can work on frontend/backend simultaneously
3. **Scalability** - Each service can be scaled independently
4. **Maintainability** - Clean code organization makes maintenance easier
5. **Deployment Flexibility** - Services can be deployed to different environments
6. **Technology Independence** - Frontend and backend can evolve separately

## Security Considerations

- JWT tokens for authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Environment variables for sensitive data