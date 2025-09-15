# GST Accounting App

A comprehensive GST-compliant billing, accounting, and inventory management solution for Indian small to medium businesses.

## Features

- **Role-based Authentication**: ADMIN and MERCHANT roles with JWT tokens
- **Multiple Login Methods**: Email/password and phone/OTP authentication
- **SMS Integration**: Real OTP delivery via SMS gateway
- **GST Compliance**: HSN/SAC codes, tax calculations, e-invoices
- **Inventory Management**: Stock tracking, barcode scanning, low-stock alerts
- **Customer/Supplier Management**: Complete contact and transaction history
- **Reports & Analytics**: Profit/loss, GST filings, sales summaries
- **Offline Support**: PWA with local data storage and sync
- **Voice Assistant**: Google Gemini API integration for voice commands

## Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.3.4**
- **Spring Security** (JWT authentication)
- **Spring Data JPA**
- **PostgreSQL 16+**
- **Flyway** (database migrations)

### Frontend
- **Next.js 14+** (App Router)
- **React 18**
- **Tailwind CSS**
- **Axios** (API calls)
- **React Hook Form**

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- PostgreSQL 16 or higher
- Maven 3.6 or higher

## Setup Instructions

### 1. Database Setup

```sql
-- Create database
CREATE DATABASE gst_accounting;

-- Create user (optional)
CREATE USER gst_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gst_accounting TO gst_user;
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Update `src/main/resources/application.properties` with your database credentials:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Update SMS gateway credentials:
```properties
sms.gateway.user=your_sms_username
sms.gateway.password=your_sms_password
```

4. Run the application:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register with email/password
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/send-otp` - Send OTP to phone
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/register-with-otp` - Register with OTP
- `GET /api/v1/auth/me` - Get current user details

### Request/Response Examples

#### Register Request
```json
{
  "username": "merchant1",
  "password": "password123",
  "email": "merchant@example.com",
  "phone": "9876543210",
  "businessName": "My Business",
  "registerType": "email"
}
```

#### Login Request
```json
{
  "username": "merchant@example.com",
  "password": "password123",
  "loginType": "email"
}
```

#### Send OTP Request
```json
{
  "phone": "9876543210"
}
```

#### Verify OTP Request
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

## Default Credentials

- **Admin User**: 
  - Username: `admin`
  - Password: `admin123`
  - Email: `admin@gstapp.com`

## Security Features

- JWT token-based authentication
- Password hashing with BCrypt
- Role-based access control (RBAC)
- CORS configuration
- Input validation
- OTP rate limiting (max 3 attempts, 1-minute cooldown)

## SMS Gateway Integration

The app integrates with `http://control.bestsms.co.in/` for OTP delivery. Update the credentials in `application.properties`:

```properties
sms.gateway.user=your_username
sms.gateway.password=your_password
sms.gateway.sender=GSTAPP
```

## Database Schema

The application uses Flyway for database migrations. The initial migration creates:

- `users` table with role-based access
- `otp_verifications` table for OTP management
- Proper indexes for performance
- Default admin user

## Development

### Backend Development
```bash
cd backend
mvn spring-boot:run
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Migration
```bash
cd backend
mvn flyway:migrate
```

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

## Deployment

### Backend Deployment
1. Build the JAR file:
```bash
mvn clean package
```

2. Run the JAR:
```bash
java -jar target/gst-accounting-backend-0.0.1-SNAPSHOT.jar
```

### Frontend Deployment
1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Environment Variables

### Backend
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `SMS_GATEWAY_USER`
- `SMS_GATEWAY_PASSWORD`

### Frontend
- `NEXT_PUBLIC_API_URL`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@gstapp.com or create an issue in the repository.
