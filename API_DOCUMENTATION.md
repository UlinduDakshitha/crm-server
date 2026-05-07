# CRM Server API Documentation

## Base URL

`http://localhost:5000/api`

## Authentication

All endpoints (except login/register) require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## LEADS ENDPOINTS

### 1. Get All Leads

**GET** `/leads`

**Query Parameters:**

- `status` (optional): Filter by status (New, Contacted, Qualified, Proposal Sent, Won, Lost)
- `source` (optional): Filter by source (Website, Phone, Email, Referral, Social Media, Event, Other)
- `assignedSalesperson` (optional): Filter by assigned salesperson ID
- `search` (optional): Search by lead name, company name, or email (case-insensitive)

**Example Requests:**

```bash
# Get all leads
GET /leads

# Filter by status
GET /leads?status=Qualified

# Filter by source
GET /leads?source=Website

# Filter by assigned salesperson
GET /leads?assignedSalesperson=user_id

# Search for leads
GET /leads?search=john

# Combine multiple filters
GET /leads?status=Qualified&source=Website&search=abc

# Filter by salesperson and status
GET /leads?assignedSalesperson=user_id&status=Won
```

**Response:**

```json
[
  {
    "_id": "lead_id",
    "name": "John Doe",
    "company": "ABC Corp",
    "email": "john@example.com",
    "phone": "+1234567890",
    "source": "Website",
    "assignedSalesperson": {
      "_id": "user_id",
      "name": "Jane Smith",
      "email": "jane@company.com"
    },
    "status": "Qualified",
    "value": 50000,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
]
```

### 2. Get Single Lead

**GET** `/leads/:id`

**Response:** Single lead object (same structure as above)

### 3. Create Lead

**POST** `/leads`

**Required Fields:**

- `name`: string
- `company`: string
- `email`: string (valid email format)
- `phone`: string
- `source`: string (Website, Phone, Email, Referral, Social Media, Event, Other)

**Optional Fields:**

- `assignedSalesperson`: user_id
- `status`: string (default: "New")
- `value`: number (default: 0)

**Request Body:**

```json
{
  "name": "John Doe",
  "company": "ABC Corp",
  "email": "john@example.com",
  "phone": "+1234567890",
  "source": "Website",
  "assignedSalesperson": "user_id",
  "status": "New",
  "value": 50000
}
```

**Response:** Created lead object with `_id`

### 4. Update Lead

**PUT** `/leads/:id`

**Body:** Any lead fields to update

```json
{
  "name": "Jane Doe",
  "status": "Contacted",
  "value": 75000
}
```

**Response:** Updated lead object

### 5. Update Lead Status Only

**PATCH** `/leads/:id/status`

**Body:**

```json
{
  "status": "Qualified"
}
```

Valid statuses: `New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, `Lost`

**Response:** Updated lead object

### 6. Delete Lead

**DELETE** `/leads/:id`

**Response:**

```json
{
  "message": "Lead deleted successfully",
  "lead": {
    /* deleted lead object */
  }
}
```

---

## NOTES ENDPOINTS

### 1. Add Note to Lead

**POST** `/notes`

**Required Fields:**

- `leadId`: ObjectId of the lead
- `content`: string - the note content

**Request Body:**

```json
{
  "leadId": "lead_id",
  "content": "Customer interested in premium package"
}
```

**Response:**

```json
{
  "_id": "note_id",
  "leadId": "lead_id",
  "content": "Customer interested in premium package",
  "createdBy": {
    "_id": "user_id",
    "name": "Jane Smith",
    "email": "jane@company.com"
  },
  "createdAt": "2024-01-20T14:22:00Z",
  "updatedAt": "2024-01-20T14:22:00Z"
}
```

### 2. Get All Notes for a Lead

**GET** `/notes/lead/:leadId`

**Response:** Array of note objects (sorted by most recent first)

### 3. Get Single Note

**GET** `/notes/:noteId`

**Response:** Single note object

### 4. Update Note

**PUT** `/notes/:noteId`

**Request Body:**

```json
{
  "content": "Updated note content"
}
```

**Response:** Updated note object

### 5. Delete Note

**DELETE** `/notes/:noteId`

**Response:**

```json
{
  "message": "Note deleted successfully",
  "note": {
    /* deleted note object */
  }
}
```

---

## DASHBOARD ENDPOINTS

### Get Dashboard Statistics

**GET** `/dashboard`

**Response:**

```json
{
  "summary": {
    "totalLeads": 45,
    "totalNotes": 127,
    "conversionRate": "22.22"
  },
  "leadsByStatus": {
    "new": 15,
    "contacted": 12,
    "qualified": 8,
    "proposalSent": 6,
    "won": 10,
    "lost": 4
  },
  "dealValue": {
    "totalEstimatedValue": 500000,
    "totalWonValue": 150000,
    "averageDealValue": "11111.11",
    "wonValuePercentage": "30.00"
  }
}
```

---

## EXAMPLE WORKFLOW

### 1. Create a new lead

```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "company": "ABC Corp",
    "email": "john@example.com",
    "phone": "+1234567890",
    "source": "Website",
    "value": 50000
  }'
```

### 2. Add a note to the lead

```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "<lead_id_from_step_1>",
    "content": "Initial contact made, customer seems interested"
  }'
```

### 3. Update lead status

```bash
curl -X PATCH http://localhost:5000/api/leads/<lead_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Contacted"
  }'
```

### 4. Get dashboard statistics

```bash
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

### 5. Filter leads by status

```bash
curl "http://localhost:5000/api/leads?status=Qualified" \
  -H "Authorization: Bearer <token>"
```

### 6. Filter leads by source

```bash
curl "http://localhost:5000/api/leads?source=Website" \
  -H "Authorization: Bearer <token>"
```

### 7. Filter leads by assigned salesperson

```bash
curl "http://localhost:5000/api/leads?assignedSalesperson=<salesperson_user_id>" \
  -H "Authorization: Bearer <token>"
```

### 8. Search for leads by name, company, or email

```bash
curl "http://localhost:5000/api/leads?search=john" \
  -H "Authorization: Bearer <token>"
```

### 9. Combine multiple filters

```bash
# Get all qualified leads assigned to a specific salesperson
curl "http://localhost:5000/api/leads?status=Qualified&assignedSalesperson=<user_id>" \
  -H "Authorization: Bearer <token>"

# Get all website leads from a specific company with search
curl "http://localhost:5000/api/leads?source=Website&search=ABC" \
  -H "Authorization: Bearer <token>"
```

## Error Responses

### Bad Request (400)

```json
{
  "message": "Please provide all required fields: name, company, email, phone, source"
}
```

### Not Found (404)

```json
{
  "message": "Lead not found"
}
```

### Unauthorized (401)

```json
{
  "message": "No token" or "Invalid token"
}
```

### Server Error (500)

```json
{
  "message": "Error message"
}
```
