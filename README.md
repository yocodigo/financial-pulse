# Financial Dashboard

A comprehensive financial management application that helps users track their investments, manage accounts, and monitor market data. Built with Spring Boot and Angular, this application provides a modern, responsive interface for financial portfolio management.

## Features

- **Portfolio Management**: Track stocks, crypto, and other investments
- **Account Management**: Manage multiple financial accounts and transactions
- **Market Data**: Real-time market data and historical analysis
- **Dashboard**: Visual representation of financial metrics and performance
- **Authentication**: Secure user authentication and authorization

## Tech Stack

### Backend
- Spring Boot 3.2.3
- Spring Security
- Spring Data JPA
- PostgreSQL
- Maven
- Java 17

### Frontend
- Angular 17
- Angular Material
- Chart.js
- TypeScript
- SCSS

### Infrastructure
- Podman for containerization
- CircleCI for CI/CD
- Nginx for serving frontend
- Honeycomb for observability

## Prerequisites

- Java 17 or later
- Node.js 18 or later
- Podman
- PostgreSQL 14 or later
- Maven
- npm

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/financial-pulse.git
cd financial-dashboard
```

### 2. Database Setup

#### Using Podman
```bash
# Start PostgreSQL container
podman run -d \
  --name financial-db \
  -e POSTGRES_DB=financial_dashboard \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:14-alpine

# Connect to database
podman exec -it financial-db psql -U postgres -d financial_dashboard
```

#### Using Local PostgreSQL
1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE financial_dashboard;
```

### 3. Backend Setup

```bash
cd backend

# Build the application
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:4200`

### 5. Using Podman Compose (Alternative Setup)

```bash
# Start all services
podman-compose up

# Stop all services
podman-compose down
```

## Development

### Backend Development

- The backend follows a layered architecture:
  - Controllers: Handle HTTP requests
  - Services: Implement business logic
  - Repositories: Manage data access
  - Models: Define data structures

- Key packages:
  - `com.financialdashboard.controller`: REST endpoints
  - `com.financialdashboard.service`: Business logic
  - `com.financialdashboard.repository`: Data access
  - `com.financialdashboard.model`: Data models
  - `com.financialdashboard.config`: Configuration classes

### Frontend Development

- The frontend follows Angular best practices:
  - Components: UI elements
  - Services: Business logic and API calls
  - Models: TypeScript interfaces
  - Guards: Route protection
  - Interceptors: HTTP request/response handling

- Key directories:
  - `src/app/components`: Angular components
  - `src/app/services`: Angular services
  - `src/app/models`: TypeScript interfaces
  - `src/app/guards`: Route guards
  - `src/app/interceptors`: HTTP interceptors

## Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Observability

The application uses Honeycomb for observability. To view traces and metrics:

1. Set up a Honeycomb account
2. Configure your environment variables:
```bash
export HONEYCOMB_API_KEY=your_api_key
export HONEYCOMB_SERVICE_NAME=financial-dashboard
```

## API Documentation

The API documentation is available at `http://localhost:8080/swagger-ui.html` when running the backend.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 