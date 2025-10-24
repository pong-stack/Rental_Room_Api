# NestJS API Documentation

## Base URL

```
http://localhost:3000
```

## Authentication Endpoints

### 1. User Registration

**POST** `/auth/register`

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "home_owner",
  "phoneNumber": "+1234567890"
}
```

**Valid Role Values:**

- `"admin"`
- `"home_owner"`
- `"user"` (default if not provided)

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "home_owner",
    "phoneNumber": "+1234567890",
    "createdAt": "2025-01-24T23:52:36.000Z",
    "updatedAt": "2025-01-24T23:52:36.000Z"
  }
}
```

### 2. User Login

**POST** `/auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "role": "home_owner"
  }
}
```

### 3. Get User Profile

**GET** `/auth/profile`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "home_owner",
  "phoneNumber": "+1234567890",
  "createdAt": "2025-01-24T23:52:36.000Z",
  "updatedAt": "2025-01-24T23:52:36.000Z"
}
```

## User Management Endpoints

### 4. Get All Users

**GET** `/users`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 5. Get User by ID

**GET** `/users/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 6. Update User

**PATCH** `/users/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "fullName": "John Updated",
  "phoneNumber": "+9876543210"
}
```

### 7. Delete User

**DELETE** `/users/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

## Home Management Endpoints

### 8. Get All Homes

**GET** `/homes`

### 9. Get My Homes

**GET** `/homes/my-homes`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 10. Get Home by ID

**GET** `/homes/:id`

### 11. Create Home

**POST** `/homes`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "My Beautiful Home",
  "address": "123 Main Street, City, State",
  "description": "A lovely home with great amenities"
}
```

### 12. Update Home

**PUT** `/homes/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 13. Delete Home

**DELETE** `/homes/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 14. Create Room

**POST** `/homes/:homeId/rooms`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "Master Bedroom",
  "description": "Spacious master bedroom with en-suite",
  "price": 150.0,
  "isAvailable": true
}
```

### 15. Update Room

**PUT** `/homes/rooms/:roomId`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 16. Delete Room

**DELETE** `/homes/rooms/:roomId`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 17. Create Room Rule

**POST** `/homes/rooms/:roomId/rules`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "ruleTitle": "No Smoking",
  "ruleDescription": "Smoking is strictly prohibited in this room"
}
```

### 18. Update Room Rule

**PUT** `/homes/rules/:ruleId`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 19. Delete Room Rule

**DELETE** `/homes/rules/:ruleId`

**Headers:**

```
Authorization: Bearer <access_token>
```

## Admin Endpoints

### 20. Get Statistics

**GET** `/admin/statistics`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 21. Get Verification Requests

**GET** `/admin/verification-requests`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 22. Get Verification Request by ID

**GET** `/admin/verification-requests/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 23. Review Verification Request

**PUT** `/admin/verification-requests/:id/review`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "status": "approved",
  "reviewNotes": "All documents verified successfully"
}
```

### 24. Get All Users (Admin)

**GET** `/admin/users`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 25. Get User by ID (Admin)

**GET** `/admin/users/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 26. Update User Role

**PUT** `/admin/users/:id/role`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "role": "admin"
}
```

### 27. Get All Homes (Admin)

**GET** `/admin/homes`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 28. Get Home by ID (Admin)

**GET** `/admin/homes/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

## Invoice Endpoints

### 29. Get All Invoices

**GET** `/invoices`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 30. Get Invoice by ID

**GET** `/invoices/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 31. Create Invoice

**POST** `/invoices`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "homeId": 1,
  "amount": 500.0,
  "dueDate": "2025-02-01",
  "description": "Monthly rent payment"
}
```

### 32. Update Invoice Status

**PUT** `/invoices/:id/status`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "status": "paid"
}
```

### 33. Add Invoice Item

**POST** `/invoices/:id/items`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "description": "Electricity bill",
  "amount": 75.5
}
```

### 34. Delete Invoice Item

**DELETE** `/invoices/items/:itemId`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 35. Get Invoices by Home

**GET** `/invoices/home/:homeId`

**Headers:**

```
Authorization: Bearer <access_token>
```

## Verification Endpoints

### 36. Request Verification

**POST** `/verification/request`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "homeId": 1
}
```

### 37. Get My Verification Requests

**GET** `/verification/my-requests`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 38. Get Verification Request by ID

**GET** `/verification/requests/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

### 39. Delete Verification Request

**DELETE** `/verification/requests/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

## Error Responses

### Validation Error (400)

```json
{
  "message": ["property fullName should not exist", "property role should not exist"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Unauthorized (401)

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### Forbidden (403)

```json
{
  "message": "Forbidden",
  "statusCode": 403
}
```

### Not Found (404)

```json
{
  "message": "Not Found",
  "statusCode": 404
}
```

## Postman Collection Setup

1. **Base URL**: `http://localhost:3000`
2. **Content-Type**: `application/json`
3. **Authorization**: Use Bearer token for protected routes

### Environment Variables for Postman:

- `base_url`: `http://localhost:3000`
- `access_token`: (set after login)

### Common Headers:

```
Content-Type: application/json
Authorization: Bearer {{access_token}}
```

## Testing the API

### Step 1: Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "home_owner",
    "phoneNumber": "+1234567890"
  }'
```

### Step 2: Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Step 3: Use the token for protected routes

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
