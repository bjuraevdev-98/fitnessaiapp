# Fitness Microservice

A full-stack fitness tracking application built with a **Spring Cloud microservices** backend and a **React** frontend. Users can log workouts and receive AI-powered personalized recommendations powered by the **Google Gemini API**.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              React Frontend (Vite + MUI)                │
│                     Port: 5173                          │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP (OAuth2 JWT)
                           ▼
             ┌─────────────────────────┐
             │  API Gateway            │
             │  Spring Cloud Gateway   │
             │  Port: 8080             │
             └────────────┬────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌────────────┐  ┌──────────────┐  ┌──────────┐
   │  User      │  │  Activity    │  │    AI    │
   │  Service   │  │  Service     │  │  Service │
   │  Port 8081 │  │  Port 8082   │  │  Port    │
   │  Postgres  │  │  MongoDB     │  │  8083    │
   └────────────┘  └──────┬───────┘  │  MongoDB │
                          │          └────┬─────┘
                          │ Publish       │ Consume
                          ▼               ▼
                   ┌──────────────────────────┐
                   │       RabbitMQ           │
                   │  Port: 5672              │
                   └──────────────────────────┘

Supporting Services:
  Eureka Registry  → Port 8761
  Config Server    → Port 8888
  Keycloak (OAuth2) → Port 8181
```

### Data Flow

1. User logs an activity via the frontend
2. API Gateway validates the JWT and routes to Activity Service
3. Activity Service validates the user (calls User Service), saves to MongoDB, then publishes the activity to RabbitMQ
4. AI Service consumes the message, calls Google Gemini API, generates a structured recommendation, and stores it in MongoDB
5. User views the activity detail page — recommendations appear automatically

---

## Services

| Service | Port | Description | Database |
|---|---|---|---|
| **Frontend** | 5173 | React + Vite UI | — |
| **API Gateway** | 8080 | Routing, JWT validation, CORS | — |
| **User Service** | 8081 | User registration & profiles | PostgreSQL |
| **Activity Service** | 8082 | Activity tracking | MongoDB |
| **AI Service** | 8083 | Gemini-powered recommendations | MongoDB |
| **Config Server** | 8888 | Centralized configuration | — |
| **Eureka** | 8761 | Service registry & discovery | — |

### External Dependencies

| Dependency | Port | Purpose |
|---|---|---|
| PostgreSQL | 5432 | User data persistence |
| MongoDB | 27017 | Activity & recommendation data |
| RabbitMQ | 5672 | Async messaging between services |
| Keycloak | 8181 | OAuth2 / OIDC identity provider |

---

## Technology Stack

### Backend
- **Java 25**
- **Spring Boot 4.0.3**
- **Spring Cloud 2025.1.0**
  - Spring Cloud Gateway (WebFlux)
  - Spring Cloud Config (centralized config)
  - Netflix Eureka (service discovery)
- **Spring Data JPA** — PostgreSQL (User Service)
- **Spring Data MongoDB** — Activity & AI Services
- **Spring AMQP** — RabbitMQ messaging
- **Spring Security** — OAuth2 JWT resource server
- **Spring WebFlux** — Reactive HTTP client (inter-service calls)
- **Lombok**, **Jackson**

### Frontend
- **React 19** with **Vite 8**
- **Redux Toolkit 2** — global state management
- **Material-UI 7** — component library
- **React Router 7** — client-side routing
- **Axios** — HTTP client
- **react-oauth2-code-pkce** — OAuth2 PKCE auth flow

### Auth & AI
- **Keycloak** — OAuth2/OIDC provider (realm: `fitness-oauth2`)
- **Google Gemini API** — AI fitness recommendations

---

## Prerequisites

- Java 25+
- Node.js 20+
- PostgreSQL 15+
- MongoDB 7+
- RabbitMQ 3+
- Keycloak 25+ (or Docker)
- Google Gemini API key

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd fitness-microservice
```

### 2. Set up external services

Start PostgreSQL, MongoDB, RabbitMQ, and Keycloak. Using Docker is the easiest approach:

```bash
# PostgreSQL
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres123 -p 5432:5432 postgres:15

# MongoDB
docker run -d --name mongo -p 27017:27017 mongo:7

# RabbitMQ (with management UI)
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Keycloak
docker run -d --name keycloak -p 8181:8080 \
  -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

### 3. Configure Keycloak

1. Log in to Keycloak admin console at `http://localhost:8181`
2. Create a realm named **`fitness-oauth2`**
3. Create a public client named **`oauth2-pkce-client`** with:
   - Standard Flow enabled
   - Valid redirect URIs: `http://localhost:5173/*`
   - Web origins: `http://localhost:5173`
4. Create user accounts for testing

### 4. Set environment variables (AI Service)

```bash
export GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
export GEMINI_API_KEY=<your-gemini-api-key>
```

On Windows:
```cmd
set GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
set GEMINI_API_KEY=<your-gemini-api-key>
```

### 5. Start backend services (in order)

Each service is a Maven project. From its directory, run:

```bash
./mvnw spring-boot:run
```

**Start in this order:**

```bash
# 1. Eureka (service registry)
cd eureka && ./mvnw spring-boot:run

# 2. Config Server (centralized config)
cd configserver && ./mvnw spring-boot:run

# 3. API Gateway
cd gateway && ./mvnw spring-boot:run

# 4. User Service
cd userservice && ./mvnw spring-boot:run

# 5. Activity Service
cd activityservice && ./mvnw spring-boot:run

# 6. AI Service (needs GEMINI env vars set)
cd aiservice && ./mvnw spring-boot:run
```

> All services fetch their configuration from the Config Server on startup. Eureka and Config Server must be running first.

### 6. Start the frontend

```bash
cd fitness-app-frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Configuration

All backend service configs live in the Config Server:

```
configserver/src/main/resources/config/
├── api-gateway.yml        # Gateway routes, OAuth2 JWKS URI
├── user-service.yml       # PostgreSQL connection, JPA settings
├── activity-service.yml   # MongoDB URI, RabbitMQ settings
└── ai-service.yml         # MongoDB URI, RabbitMQ, Gemini API settings
```

Default database credentials (update for production):

| Database | Host | Credentials |
|---|---|---|
| PostgreSQL | localhost:5432 | postgres / postgres123 |
| MongoDB | localhost:27017 | (none) |
| RabbitMQ | localhost:5672 | guest / guest |

---

## API Endpoints

All requests go through the API Gateway at `http://localhost:8080`.

Authentication requires:
- `Authorization: Bearer <JWT>` header
- `X-User-Id: <userId>` header (set by frontend automatically)

### Users
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/users/register` | Register a new user |
| `GET` | `/api/users/{userId}` | Get user profile |
| `GET` | `/api/users/{userId}/validate` | Validate user existence |

### Activities
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/activities` | Log a new activity |
| `GET` | `/api/activities` | Get all activities for the user |
| `GET` | `/api/activities/{id}` | Get a specific activity |

### Recommendations (AI)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/recommendations/user/{userId}` | Get all recommendations for a user |
| `GET` | `/api/recommendations/activity/{activityId}` | Get recommendation for an activity |

### Activity Types
`RUNNING`, `WALKING`, `CYCLING`, `SWIMMING`, `WEIGHT_TRAINING`, `YOGA`, `HIIT`, `CARDIO`, `STRETCHING`, `OTHER`

---

## Key Design Decisions

- **Config Server first** — all services are stateless regarding config; the Config Server holds all runtime configuration
- **Async AI recommendations** — RabbitMQ decouples activity logging from AI processing; the user gets an instant response for logging, and recommendations appear asynchronously
- **OAuth2 PKCE** — the frontend uses the PKCE flow (no client secret in browser) via Keycloak
- **JWT propagation** — the API Gateway validates JWTs; downstream services trust the `X-User-Id` header set by clients (validated at the gateway layer)
- **Service discovery** — all inter-service calls use Eureka-registered names (e.g., `lb://USER-SERVICE`) for transparent load balancing

---

## Project Structure

```
fitness-microservice/
├── eureka/                  # Eureka service registry
├── configserver/            # Centralized config server
│   └── src/main/resources/config/   # Per-service YAML configs
├── gateway/                 # API Gateway + security
├── userservice/             # User registration & management
├── activityservice/         # Activity tracking + RabbitMQ publisher
├── aiservice/               # AI recommendation engine + RabbitMQ consumer
└── fitness-app-frontend/    # React + Vite frontend
```

---

## Monitoring

- **Eureka Dashboard** — `http://localhost:8761` (view registered services)
- **RabbitMQ Management** — `http://localhost:15672` (guest/guest)
- **Keycloak Admin** — `http://localhost:8181` (admin/admin)
