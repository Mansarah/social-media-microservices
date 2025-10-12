

# Node.js Microservices Social Media Platform

A scalable, microservices-based social media platform built with Node.js, Docker, Redis, RabbitMQ, and MongoDB. This project demonstrates how to build a distributed system with independent services for authentication, posts, media, and search.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Services](#services)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **User Authentication**: Register, login, logout, and refresh tokens.
- **Post Management**: Create, read, delete, and search posts.
- **Media Upload**: Upload and manage media files using Cloudinary.
- **Search Functionality**: Full-text search for posts.
- **Rate Limiting**: Protects against DDoS and brute-force attacks.
- **Event-Driven Architecture**: Uses RabbitMQ for inter-service communication.
- **Caching**: Redis for caching posts and rate limiting.
- **Dockerized**: Easy deployment and scaling with Docker Compose.

---

## Architecture

The project follows a **microservices architecture** with the following services:

- **API Gateway**: Routes requests to appropriate services.
- **Auth Service**: Handles user authentication and authorization.
- **Post Service**: Manages post creation, retrieval, and deletion.
- **Media Service**: Handles media uploads and deletions.
- **Search Service**: Provides full-text search for posts.

All services communicate via **RabbitMQ** for event-driven workflows and use **Redis** for caching and rate limiting.

---

## Services

| Service         | Port  | Description                                                                 |
|-----------------|-------|-----------------------------------------------------------------------------|
| API Gateway     | 3000  | Routes requests to microservices.                                           |
| Auth Service    | 3001  | Handles user registration, login, and token management.                   |
| Post Service    | 3002  | Manages posts (create, read, delete).                                      |
| Media Service   | 3003  | Handles media uploads and deletions.                                       |
| Search Service  | 3004  | Provides full-text search for posts.                                       |
| Redis           | 6379  | Caching and rate limiting.                                                  |
| RabbitMQ        | 5672  | Event-driven communication between services.                               |

---

## Technologies

- **Node.js**: Runtime environment.
- **Express.js**: Web framework.
- **MongoDB**: Database for each service.
- **Redis**: Caching and rate limiting.
- **RabbitMQ**: Message broker for event-driven communication.
- **Docker**: Containerization.
- **Cloudinary**: Media storage.
- **JWT**: Authentication.
- **Winston**: Logging.
- **Joi**: Request validation.

---

## Prerequisites

- Docker
- Docker Compose
- Node.js (v18+)
- MongoDB
- Cloudinary account (for media storage)

---

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/nodejs-microservices.git
   cd nodejs-microservices
   ```

2. **Set up environment variables**:
   Create `.env` files for each service (see [Environment Variables](#environment-variables)).

3. **Build and start the services**:
   ```bash
   docker-compose up --build
   ```

---

## Environment Variables

Each service requires its own `.env` file. Below are the required variables:

### API Gateway
```env
PORT=3000
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://rabbitmq:5672
JWT_SECRET=your_jwt_secret
AUTH_SERVICE_URL=http://identity-service:3001
POST_SERVICE_URL=http://post-service:3002
MEDIA_SERVICE_URL=http://media-service:3003
SEARCH_SERVICE_URL=http://search-service:3004
```

### Auth Service
```env
PORT=3001
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://rabbitmq:5672
MONGODB_URI=mongodb://mongo:27017/auth_db
JWT_SECRET=your_jwt_secret
```

### Post Service
```env
PORT=3002
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://rabbitmq:5672
MONGODB_URI_POST=mongodb://mongo:27017/post_db
```

### Media Service
```env
PORT=3003
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://rabbitmq:5672
MONGODB_URI_MEDIA=mongodb://mongo:27017/media_db
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Search Service
```env
PORT=3004
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://rabbitmq:5672
MONGODB_URI_SEARCH=mongodb://mongo:27017/search_db
```

---

## Running the Project

1. **Start the services**:
   ```bash
   docker-compose up
   ```

2. **Access the API Gateway**:
   Open `http://localhost:3000` in your browser or use tools like Postman to interact with the APIs.

---

## API Documentation

### Auth Service
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Login and get JWT tokens.
- `POST /api/auth/refresh-token`: Refresh access token.
- `POST /api/auth/logout`: Logout and invalidate refresh token.

### Post Service
- `POST /api/posts/create-post`: Create a new post.
- `GET /api/posts/all-post`: Get all posts (paginated).
- `GET /api/posts/get-post/:id`: Get a post by ID.
- `DELETE /api/posts/delete-post/:id`: Delete a post.

### Media Service
- `POST /api/media/upload`: Upload media.
- `GET /api/media/get-media`: Get all media.

### Search Service
- `GET /api/search/search-post?query=search_term`: Search posts.

---