# Node (Express) Server + MongoDB

NodeJS (Express) backend.
Database is MongoDB.
Database schema is users, and users with journals and journal categories.

## API Routes

### Authentication

- POST `/auth/bearer` - Authenticate using bearer token

### User Management

- POST `/user/create` - Create a new user
- POST `/user/login` - User login
- POST `/user/forgot-password` - Initiate forgot password process
- POST `/user/reset-password` - Reset user password
- GET `/user/email-available` - Check if email is available
- GET `/user/username-available` - Check if username is available
- GET `/user/users` - Get all users (admin only)
- DELETE `/user/delete-all` - Delete all users (admin only)

### Journal Management

- POST `/user/journal/create` - Create a new journal
- PUT `/user/journal/edit` - Edit an existing journal
- GET `/user/journal/journals` - Get all journals for the user
- DELETE `/user/journal/delete` - Delete a journal

### Category Management

- POST `/user/journal/category/create` - Create a new category
- PUT `/user/journal/category/edit` - Edit an existing category
- DELETE `/user/journal/category/delete` - Delete a category
- POST `/user/journal/category/create-many` - Create multiple categories at once

Note: Most routes are protected and require authentication. The exact HTTP methods (GET, POST, etc.) should be verified in the actual route files.

### File Streaming

- `/streams/file` - Stream a file

## Swagger

Visit: http://localhost:3000/api-docs/#/default
https://editor.swagger.io/

```

```

ssh -i C:\Users\kevin\ssh_keys\node_server_key_pair.pem ec2-user@54.80.167.254
