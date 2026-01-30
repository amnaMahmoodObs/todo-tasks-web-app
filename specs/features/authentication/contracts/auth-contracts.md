# API Contracts: Authentication Endpoints

**Feature**: Authentication
**Date**: 2026-01-28
**Base URL**: `http://localhost:8000` (development), `https://api.your-app.com` (production)

---

## 1. User Signup

**Endpoint**: `POST /api/auth/signup`

**Purpose**: Register a new user account

**Authentication**: None (public endpoint)

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"  // optional
}
```

**Success Response** (201 Created):
```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2026-01-28T10:30:00Z"
  },
  "message": "Account created successfully. Please log in."
}
```

**Error Responses**:
- 400 Bad Request: Invalid email format or password too short
- 409 Conflict: Email already registered
```json
{
  "error": "This email is already registered. Please log in instead",
  "code": "EMAIL_EXISTS"
}
```

---

## 2. User Login

**Endpoint**: `POST /api/auth/login`

**Purpose**: Authenticate user and issue JWT token

**Authentication**: None (public endpoint)

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response** (200 OK):
```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2026-02-04T10:30:00Z"
}
```

**Response Headers**:
```
Set-Cookie: auth_token=<jwt_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Error Responses**:
- 401 Unauthorized: Invalid credentials
```json
{
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

---

## 3. User Logout

**Endpoint**: `POST /api/auth/logout`

**Purpose**: End user session (clear token)

**Authentication**: Required (JWT token)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

**Response Headers**:
```
Set-Cookie: auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

**Error Responses**:
- 401 Unauthorized: Missing or invalid token

---

## 4. Verify Token

**Endpoint**: `GET /api/auth/verify`

**Purpose**: Verify JWT token validity and get current user

**Authentication**: Required (JWT token)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):
```json
{
  "valid": true,
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "expires_at": "2026-02-04T10:30:00Z"
}
```

**Error Responses**:
- 401 Unauthorized: Token expired or invalid
```json
{
  "error": "Token expired. Please log in again",
  "code": "TOKEN_EXPIRED"
}
```

---

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| EMAIL_EXISTS | 409 | Email already registered |
| INVALID_CREDENTIALS | 401 | Wrong email or password |
| TOKEN_EXPIRED | 401 | JWT token has expired |
| TOKEN_INVALID | 401 | JWT signature verification failed |
| VALIDATION_ERROR | 400 | Request data validation failed |

---

## Request/Response Standards

**Content-Type**: `application/json`

**Authentication Header Format**: `Authorization: Bearer <jwt_token>`

**Timestamp Format**: ISO 8601 (e.g., `2026-01-28T10:30:00Z`)

**UUID Format**: RFC 4122 (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

---

**Contracts Status**: ✅ COMPLETE
