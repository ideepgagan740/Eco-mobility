# Eco Mobility Microservices

Services:
- user-service (:3001): /register, /login
- car-service (:3002): GET /cars, POST /cars (admin)
- booking-service (:3003): POST /bookings, GET /bookings, PUT /bookings/:id/cancel

Prereqs:
- Node 18+
- Docker + Docker Compose

Setup:
1) Start infra
   - docker compose up -d
2) Install deps
   - (cd user-service && npm i)
   - (cd car-service && npm i)
   - (cd booking-service && npm i)
3) Env (all services)
   - Copy each service's .env.example to .env and fill in the values.
     - user-service: JWT_SECRET, MONGODB_URI, PORT
     - car-service:  JWT_SECRET, MONGODB_URI, REDIS_URL, PORT
     - booking-service: JWT_SECRET, MONGODB_URI, PORT
   - .env files are gitignored; never commit secrets.
4) Seed
   - (cd user-service && npm run seed)  // creates admin@example.com/AdminPass123! and user@example.com/UserPass123!
   - (cd car-service && npm run seed)   // creates 3 cars
5) Run
   - (cd user-service && npm run dev)
   - (cd car-service && npm run dev)
   - (cd booking-service && npm run dev)

Auth:
- Login -> JWT -> Authorization: Bearer <token>
- Create car requires admin role.
- Create/cancel booking requires authenticated user.

Inter-microservice communication:
- Services communicate via HTTP API calls (REST).
- During booking creation, booking-service calls car-service to validate the target car and confirm current availability before reserving slots.
- If car-service reports the car is unavailable or the call fails, the booking is not created.

API Routes and Usage:

user-service (http://localhost:3001 or http://13.126.194.161:3001)
- POST /register
  - Use: Create a new user.
  - Body: { "name": "Jane", "email": "jane@example.com", "password": "StrongPass123!" }
  - curl:
    curl -s -X POST http://localhost:3001/register -H "Content-Type: application/json" -d '{"name":"Jane","email":"jane@example.com","password":"StrongPass123!"}'
- POST /login
  - Use: Authenticate and receive JWT.
  - Body: { "email": "jane@example.com", "password": "StrongPass123!" }
  - Returns: { "token": "<JWT>" }
  - curl:
    TOKEN=$(curl -s -X POST http://localhost:3001/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"AdminPass123!"}' | jq -r .token)

car-service (http://localhost:3002 or http://13.126.194.161:3002)
- GET /cars
  - Use: List cars. Response is cached for ~30s.
  - Optional query: ?available=true
  - curl:
    curl -s http://localhost:3002/cars
- POST /cars  (admin only)
  - Use: Create a car.
  - Auth: Authorization: Bearer $TOKEN (admin)
  - Body: { "make":"Tesla", "model":"Model 3", "plate":"ABC-123", "seats":5 }
  - curl:
    curl -s -X POST http://localhost:3002/cars -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"make":"Tesla","model":"Model 3","plate":"ABC-123","seats":5}'

booking-service (http://localhost:3003 or http://13.126.194.161:3003)
- POST /bookings
  - Use: Create a booking for a car; prevents overlaps via per-day slots (Mongo txn).
  - Auth: Authorization: Bearer $TOKEN
  - Dates: ISO8601; start inclusive, end exclusive.
  - Body: { "carId":"<carId>", "startDate":"2025-01-10", "endDate":"2025-01-12" }
  - curl:
    curl -s -X POST http://localhost:3003/bookings -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"carId":"<carId>","startDate":"2025-01-10","endDate":"2025-01-12"}'
- GET /bookings
  - Use: List bookings for the authenticated user.
  - Auth: Authorization: Bearer $TOKEN
  - curl:
    curl -s http://localhost:3003/bookings -H "Authorization: Bearer $TOKEN"
- PUT /bookings/:id/cancel
  - Use: Cancel an existing booking; frees reserved slots.
  - Auth: Authorization: Bearer $TOKEN
  - curl:
    curl -s -X PUT http://localhost:3003/bookings/<bookingId>/cancel -H "Authorization: Bearer $TOKEN"

Swagger:
- See docs/openapi.yaml (import in Swagger UI).

Tests:
- (cd booking-service && npm test) runs overlap unit test with in-memory replica set.

Base hosts: http://localhost and http://13.126.194.161
