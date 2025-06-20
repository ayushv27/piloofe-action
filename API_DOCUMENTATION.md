# Piloo.ai API Documentation

This document outlines all API endpoints for the Piloo.ai CCTV monitoring platform, including authentication, user management, camera operations, alerts, recordings, analytics, and gamification features.

## Authentication Endpoints

### POST /api/auth/login
```json
Request:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "role": "string",
    "subscriptionPlan": "string"
  }
}
```

### POST /api/auth/logout
```json
Response: 200 OK
```

### GET /api/auth/user
```json
Response:
{
  "id": "number",
  "username": "string", 
  "email": "string",
  "role": "string",
  "subscriptionPlan": "string",
  "createdAt": "date"
}
```

## User Management

### GET /api/users
```json
Response: User[]
```

### POST /api/users
```json
Request:
{
  "username": "string",
  "email": "string", 
  "password": "string",
  "role": "string"
}
```

### PUT /api/users/:id
```json
Request: Partial<User>
```

### DELETE /api/users/:id
```json
Response: 200 OK
```

## Camera Management

### GET /api/cameras
```json
Response:
[
  {
    "id": "number",
    "name": "string",
    "location": "string",
    "ip": "string",
    "rtspUrl": "string",
    "status": "active|inactive|maintenance",
    "assignedZone": "string",
    "sensitivity": "number",
    "recordingEnabled": "boolean",
    "retentionDays": "number"
  }
]
```

### POST /api/cameras
```json
Request:
{
  "name": "string",
  "location": "string",
  "ip": "string",
  "rtspUrl": "string",
  "status": "active|inactive",
  "assignedZone": "string",
  "sensitivity": "number"
}
```

### PUT /api/cameras/:id
```json
Request: Partial<Camera>
```

### DELETE /api/cameras/:id
```json
Response: 200 OK
```

## Zone Management

### GET /api/zones
```json
Response:
[
  {
    "id": "number",
    "name": "string",
    "type": "entrance|office|restricted|common",
    "description": "string"
  }
]
```

### POST /api/zones
```json
Request:
{
  "name": "string",
  "type": "entrance|office|restricted|common",
  "description": "string"
}
```

### PUT /api/zones/:id
```json
Request: Partial<Zone>
```

### DELETE /api/zones/:id
```json
Response: 200 OK
```

## Alert Management

### GET /api/alerts
```json
Response:
[
  {
    "id": "number",
    "type": "intrusion|motion|unauthorized|system",
    "description": "string",
    "severity": "low|medium|high|critical",
    "location": "string",
    "cameraId": "number",
    "timestamp": "date",
    "status": "active|resolved|dismissed",
    "videoUrl": "string"
  }
]
```

### GET /api/alerts?from=date&to=date
```json
Response: Alert[]
```

### POST /api/alerts
```json
Request:
{
  "type": "string",
  "description": "string", 
  "severity": "string",
  "location": "string",
  "cameraId": "number"
}
```

### PUT /api/alerts/:id
```json
Request: Partial<Alert>
```

### DELETE /api/alerts/:id
```json
Response: 200 OK
```

## Recordings Management

### GET /api/recordings
```json
Query Parameters:
- cameraId: number (optional)
- startDate: ISO date string (optional)
- endDate: ISO date string (optional)
- quality: "480p|720p|1080p" (optional)
- hasMotion: boolean (optional)

Response:
[
  {
    "id": "number",
    "cameraId": "number",
    "filename": "string",
    "filePath": "string",
    "startTime": "date",
    "endTime": "date", 
    "duration": "number",
    "fileSize": "number",
    "quality": "480p|720p|1080p",
    "hasMotion": "boolean",
    "hasAudio": "boolean",
    "thumbnailPath": "string",
    "createdAt": "date"
  }
]
```

### GET /api/recordings/:id
```json
Response: Recording object
```

### POST /api/recordings
```json
Request:
{
  "cameraId": "number",
  "filename": "string",
  "filePath": "string",
  "startTime": "date",
  "endTime": "date",
  "duration": "number",
  "fileSize": "number",
  "quality": "480p|720p|1080p",
  "hasMotion": "boolean",
  "hasAudio": "boolean",
  "thumbnailPath": "string"
}
```

### DELETE /api/recordings/:id
```json
Response: 200 OK
```

### GET /api/recordings/download/:id
```json
Response: File download stream
```

## Employee Monitoring

### GET /api/employees
```json
Response:
[
  {
    "id": "number",
    "name": "string",
    "employeeId": "string",
    "department": "string",
    "status": "present|absent|late",
    "checkIn": "date",
    "checkOut": "date",
    "lastSeen": "date",
    "date": "string"
  }
]
```

### GET /api/employees?date=YYYY-MM-DD
```json
Response: Employee[]
```

### POST /api/employees
```json
Request:
{
  "name": "string",
  "employeeId": "string",
  "department": "string",
  "status": "string",
  "date": "string"
}
```

### PUT /api/employees/:id
```json
Request: Partial<Employee>
```

## System Settings

### GET /api/settings
```json
Response:
{
  "id": "number",
  "alertsIntrusion": "boolean",
  "alertsMotion": "boolean",
  "alertsUnauthorized": "boolean",
  "recordingEnabled": "boolean",
  "recordingQuality": "string",
  "retentionDays": "number",
  "emailNotifications": "boolean",
  "smsNotifications": "boolean"
}
```

### PUT /api/settings
```json
Request: Partial<SystemSettings>
```

## Dashboard Statistics

### GET /api/stats
```json
Response:
{
  "activeCameras": "number",
  "todayIncidents": "number", 
  "currentAlerts": "number",
  "zoneCoverage": "string",
  "employeeStats": {
    "present": "number",
    "absent": "number",
    "late": "number",
    "avgDuration": "string"
  }
}
```

## Analytics Endpoints

### GET /api/analytics
```json
Response:
{
  "totalIncidents": "number",
  "todayIncidents": "number",
  "activeCameras": "number",
  "criticalAlerts": "number",
  "resolvedIncidents": "number",
  "avgResponseTime": "number"
}
```

### GET /api/analytics/incident-trends
```json
Response:
[
  {
    "date": "string",
    "incidents": "number",
    "resolved": "number",
    "critical": "number",
    "high": "number", 
    "medium": "number",
    "low": "number"
  }
]
```

### GET /api/analytics/alert-distribution
```json
Response:
[
  {
    "name": "string",
    "value": "number",
    "percentage": "number"
  }
]
```

### GET /api/analytics/occupancy
```json
Response:
[
  {
    "zone": "string",
    "occupancy": "number",
    "capacity": "number",
    "percentage": "number"
  }
]
```

### GET /api/analytics/camera-performance
```json
Response:
[
  {
    "id": "number",
    "name": "string",
    "uptime": "number",
    "alerts": "number",
    "lastMaintenance": "date",
    "status": "string"
  }
]
```

### GET /api/analytics/activity-heatmap
```json
Response:
[
  {
    "hour": "string",
    "monday": "number",
    "tuesday": "number",
    "wednesday": "number", 
    "thursday": "number",
    "friday": "number",
    "saturday": "number",
    "sunday": "number"
  }
]
```

## AI Search Integration

### POST /api/cctv/ask
```json
Request:
{
  "query": "string",
  "cameraIds": "number[]",
  "timeRange": {
    "start": "date",
    "end": "date"
  }
}

Response:
{
  "results": [
    {
      "timestamp": "date",
      "cameraId": "number",
      "cameraName": "string",
      "description": "string",
      "confidence": "number",
      "videoUrl": "string",
      "thumbnailUrl": "string"
    }
  ],
  "summary": "string",
  "totalResults": "number"
}
```

## Subscription Management

### GET /api/subscription-plans
```json
Response:
[
  {
    "id": "number",
    "name": "string",
    "price": "number",
    "cameras": "number",
    "features": "string[]"
  }
]
```

### POST /api/demo-requests
```json
Request:
{
  "name": "string",
  "email": "string",
  "company": "string",
  "phone": "string",
  "message": "string"
}
```

### GET /api/demo-requests
```json
Response: DemoRequest[]
```

## Search Queries

### POST /api/search-queries
```json
Request:
{
  "userId": "number",
  "query": "string",
  "filters": "object",
  "results": "number"
}
```

### GET /api/search-queries?userId=number
```json
Response: SearchQuery[]
```

## User Onboarding

### GET /api/user/onboarding
```json
Response:
{
  "currentStep": "number",
  "completedSteps": "string[]",
  "totalPoints": "number",
  "achievements": "string[]"
}
```

### POST /api/user/onboarding/complete
```json
Request:
{
  "stepId": "string"
}

Response:
{
  "message": "string",
  "stepId": "string",
  "pointsEarned": "number"
}
```

Available step IDs and their point values:
- "welcome": 10 points
- "dashboard": 20 points
- "cameras": 30 points
- "alerts": 25 points
- "ai-chat": 35 points
- "employees": 20 points
- "settings": 15 points

## Management Panel API (Company Admin)

### GET /api/admin/clients
Get all Piloo.ai clients for company management
```json
Response: [
  {
    "id": "number",
    "username": "string",
    "email": "string",
    "role": "string",
    "subscriptionPlan": "string|null",
    "subscriptionStatus": "string|null",
    "maxCameras": "number|null",
    "stripeCustomerId": "string|null",
    "stripeSubscriptionId": "string|null",
    "subscriptionEndsAt": "string|null",
    "createdAt": "string|null",
    "lastLogin": "string",
    "isActive": "boolean",
    "menuPermissions": {
      "dashboard": "boolean",
      "aiChat": "boolean",
      "liveFeed": "boolean",
      "recordings": "boolean",
      "alerts": "boolean",
      "employees": "boolean",
      "zones": "boolean",
      "reports": "boolean",
      "subscription": "boolean"
    }
  }
]
```

### PUT /api/admin/clients/:id
Update client information
```json
Request:
{
  "username": "string",
  "email": "string",
  "subscriptionPlan": "string",
  "maxCameras": "number",
  "isActive": "boolean"
}
```

### PUT /api/admin/clients/:id/status
Toggle client account status
```json
Request:
{
  "isActive": "boolean"
}

Response:
{
  "message": "string"
}
```

### PUT /api/admin/clients/:id/permissions
Update client feature access permissions
```json
Request:
{
  "permissions": {
    "dashboard": "boolean",
    "aiChat": "boolean",
    "liveFeed": "boolean",
    "recordings": "boolean",
    "alerts": "boolean",
    "employees": "boolean",
    "zones": "boolean",
    "reports": "boolean",
    "subscription": "boolean"
  }
}

Response:
{
  "message": "string"
}
```

### POST /api/admin/clients/:id/refund
Process full refund for client subscription
```json
Response:
{
  "message": "string",
  "refundId": "string",
  "amount": "number",
  "status": "string"
}
```

### POST /api/admin/clients
Create new client account
```json
Request:
{
  "username": "string",
  "email": "string",
  "maxCameras": "number",
  "subscriptionPlan": "string"
}

Response: User
```

### PUT /api/admin/clients/:id/subscription
Change client subscription plan
```json
Request:
{
  "planName": "string"
}

Response: User
```

## WebSocket Events

The frontend expects WebSocket connections at `/ws` for real-time updates:

### Connection Events
- `connection`: Initial connection confirmation
- `subscribed`: Subscription to updates confirmed

### Notification Events
```json
{
  "type": "notification",
  "data": {
    "id": "string",
    "type": "alert|system|employee|camera",
    "priority": "low|medium|high|critical",
    "title": "string",
    "message": "string",
    "timestamp": "string",
    "data": "object"
  }
}
```

### Update Events
```json
{
  "type": "update",
  "updateType": "cameras|alerts|employees|zones",
  "data": "object"
}
```

## Onboarding & Gamification

### GET /api/onboarding/progress
Get user's onboarding progress and achievement status.
```json
Response:
{
  "id": "number",
  "userId": "number",
  "currentStep": "number",
  "completedSteps": "number[]",
  "totalPoints": "number",
  "achievements": "number[]",
  "tutorialCompleted": "boolean",
  "lastActiveStep": "string",
  "onboardingStarted": "date",
  "onboardingCompleted": "date",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### GET /api/onboarding/steps
Get all available onboarding steps.
```json
Response: OnboardingStep[]
{
  "id": "number",
  "stepNumber": "number",
  "title": "string",
  "description": "string",
  "targetPage": "string",
  "targetElement": "string",
  "instructions": "string",
  "points": "number",
  "category": "string",
  "estimatedTime": "number",
  "isRequired": "boolean",
  "isActive": "boolean",
  "createdAt": "date"
}
```

### POST /api/onboarding/complete-step/:stepId
Mark an onboarding step as completed.
```json
Response:
{
  "id": "number",
  "userId": "number",
  "currentStep": "number",
  "completedSteps": "number[]",
  "totalPoints": "number",
  "achievements": "number[]",
  "tutorialCompleted": "boolean",
  "lastActiveStep": "string"
}
```

### GET /api/achievements
Get all available achievements.
```json
Response: Achievement[]
{
  "id": "number",
  "name": "string",
  "description": "string",
  "icon": "string",
  "points": "number",
  "category": "string",
  "condition": "object",
  "isActive": "boolean",
  "createdAt": "date"
}
```

### POST /api/achievements/award/:achievementId
Award an achievement to a user.
```json
Response:
{
  "id": "number",
  "userId": "number",
  "totalPoints": "number",
  "achievements": "number[]"
}
```

## Error Handling

All endpoints should return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error response format:
```json
{
  "error": "string",
  "message": "string",
  "details": "object"
}
```

## Authentication

The frontend expects session-based authentication or JWT tokens. Ensure protected routes require authentication headers or valid sessions.

## CORS Configuration

Configure CORS to allow requests from the React frontend domain.

## File Upload Support

For video/image uploads related to alerts and camera feeds, implement multipart/form-data support.