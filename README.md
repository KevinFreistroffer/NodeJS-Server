# Node (Express) Server + MongoDB

NodeJS (Express) backend.
Database is MongoDB.
Database schema is users, and users with entries and entry categories.

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

### Entry Management

- POST `/user/entry/create` - Create a new entry
- PUT `/user/entry/edit` - Edit an existing entry
- GET `/user/entry/entries` - Get all entries for the user
- DELETE `/user/entry/delete` - Delete a entry

### Category Management

- POST `/user/entry/category/create` - Create a new category
- PUT `/user/entry/category/edit` - Edit an existing category
- DELETE `/user/entry/category/delete` - Delete a category
- POST `/user/entry/category/create-many` - Create multiple categories at once

Note: Most routes are protected and require authentication. The exact HTTP methods (GET, POST, etc.) should be verified in the actual route files.

### File Streaming

- `/streams/file` - Stream a file

## Swagger

Visit: http://localhost:3000/api-docs/#/default
https://editor.swagger.io/

```

```

ssh -i C:\Users\kevin\ssh_keys\node_server_key_pair.pem ec2-user@54.80.167.254
