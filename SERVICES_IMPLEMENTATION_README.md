# Medical Services CRUD Implementation

## Overview
This document describes the implementation of CRUD (Create, Read, Update, Delete) operations for Medical Services in the Healthcare Management System.

## Features Implemented

### 1. Service Management
- **Create**: Add new medical services with name, description, and price
- **Read**: View all services in a responsive table format
- **Update**: Edit existing service information
- **Delete**: Remove services with confirmation dialog

### 2. User Interface
- Modern Bootstrap-based interface
- Responsive design for all devices
- Intuitive forms with validation
- Real-time feedback with alerts
- Modal-based forms for add/edit operations

### 3. Backend API
- RESTful API endpoints for all CRUD operations
- JSON request/response format
- Input validation and error handling
- SQL injection prevention using PreparedStatements

## Technical Implementation

### Database Layer (DAO)
**File**: `src/main/java/dao/ListOfMedicalServiceDAO.java`

**Methods**:
- `getAllServices()`: Retrieve all services
- `getServiceById(int)`: Get single service by ID
- `addService(ListOfMedicalService)`: Add new service
- `updateService(ListOfMedicalService)`: Update existing service
- `deleteService(int)`: Delete service by ID
- `serviceExists(String)`: Check if service name exists
- `serviceExistsExcludeId(String, int)`: Check name exists excluding current service

### Controller Layer
**File**: `src/main/java/controller/ServiceServlet.java`

**Endpoints**:
- `GET /services?action=api`: Get all services (JSON)
- `GET /services?action=api&id={id}`: Get service by ID (JSON)
- `POST /services?action=add`: Add new service (JSON)
- `POST /services?action=update`: Update existing service (JSON)
- `POST /services?action=delete&id={id}`: Delete service

### Frontend Interface
**File**: `src/main/webapp/view/services.html`

**Components**:
- Services listing table with pagination
- Add Service modal form
- Edit Service modal form
- Action buttons (View, Edit, Delete)
- Responsive design with Bootstrap

### JavaScript Logic
**File**: `src/main/webapp/assets/jslogic/services.js`

**Features**:
- Async API calls using Fetch API
- Form validation and error handling
- Modal management
- Real-time table updates
- SweetAlert integration for notifications

## API Documentation

### Get All Services
```
GET /services?action=api
Response: JSON array of services
```

### Get Service by ID
```
GET /services?action=api&id=123
Response: JSON service object
```

### Add Service
```
POST /services?action=add
Content-Type: application/json

{
  "name": "Blood Test",
  "description": "Complete blood count analysis",
  "price": 150000
}
```

### Update Service
```
POST /services?action=update
Content-Type: application/json

{
  "service_id": 123,
  "name": "Updated Blood Test",
  "description": "Enhanced blood analysis",
  "price": 200000
}
```

### Delete Service
```
POST /services?action=delete&id=123
Response: JSON success/error message
```

## Database Schema

**Table**: `ListOfMedicalService`
```sql
CREATE TABLE ListOfMedicalService (
    service_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL UNIQUE,
    description NVARCHAR(1000),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0)
);
```

## Validation Rules

### Frontend Validation
- Service name: Required, minimum 2 characters
- Price: Required, must be positive number
- Description: Optional

### Backend Validation
- Service name: Required, not empty after trim
- Price: Required, must be greater than 0
- Unique name validation (excluding self on update)
- Service existence validation for update/delete

## Error Handling

### HTTP Status Codes
- `200 OK`: Successful operation
- `201 Created`: Service created successfully
- `400 Bad Request`: Invalid input data
- `404 Not Found`: Service not found
- `409 Conflict`: Service name already exists
- `500 Internal Server Error`: Server-side error

### Error Response Format
```json
{
  "error": "Error message description"
}
```

### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully"
}
```

## Security Features

1. **SQL Injection Prevention**: All database queries use PreparedStatements
2. **Input Validation**: Both client-side and server-side validation
3. **Error Handling**: Proper exception handling prevents data exposure
4. **Data Sanitization**: Input trimming and validation

## User Experience Features

1. **Real-time Feedback**: Immediate validation feedback
2. **Loading States**: Loading indicators during API calls
3. **Confirmation Dialogs**: Delete confirmation to prevent accidents
4. **Responsive Design**: Works on all device sizes
5. **Intuitive Interface**: Clear navigation and actions

## File Structure
```
src/
├── main/
│   ├── java/
│   │   ├── controller/
│   │   │   └── ServiceServlet.java
│   │   ├── dao/
│   │   │   ├── DBContext.java
│   │   │   └── ListOfMedicalServiceDAO.java
│   │   └── model/
│   │       └── ListOfMedicalService.java
│   └── webapp/
│       ├── view/
│       │   └── services.html
│       └── assets/
│           └── jslogic/
│               └── services.js
```

## Testing Recommendations

1. **Unit Tests**: Test DAO methods with different scenarios
2. **Integration Tests**: Test servlet endpoints
3. **Frontend Tests**: Test JavaScript functions
4. **User Acceptance Tests**: Test complete user workflows

## Future Enhancements

1. **Search and Filter**: Add search functionality
2. **Bulk Operations**: Multiple selection and bulk actions
3. **Export Features**: Export services to Excel/PDF
4. **Audit Trail**: Track changes and modifications
5. **Service Categories**: Group services by categories
6. **Service Images**: Add image support for services

## Dependencies

### Backend
- Jakarta Servlet API
- Jackson JSON processing
- Microsoft SQL Server JDBC Driver
- Lombok (for model annotations)

### Frontend
- Bootstrap 5
- SweetAlert2 (for notifications)
- Native JavaScript (ES6+)

## Installation and Setup

1. Ensure database connection is configured in `DBContext.java`
2. Deploy the application to a servlet container (Tomcat)
3. Access the services page at `/view/services.html`
4. The API endpoints are available at `/services`

## Troubleshooting

### Common Issues
1. **Database Connection**: Check DBContext configuration
2. **404 Errors**: Verify servlet mapping in web.xml
3. **JSON Errors**: Check Content-Type headers
4. **Validation Failures**: Verify input data format

### Debug Tips
- Check browser console for JavaScript errors
- Review server logs for backend errors
- Use browser network tab to inspect API calls
- Verify database connectivity and permissions 