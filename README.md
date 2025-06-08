# Social Media Application

A modern, responsive social media application built with vanilla JavaScript, utilizing the Noroff API v2 for backend functionality.

## Features

### Required Features ✅

- [x] User registration with @noroff.no or @stud.noroff.no email
- [x] User login with JWT authentication
- [x] View post content feed
- [x] Filter post content feed
- [x] Search post content feed
- [x] View individual post content by ID
- [x] Create new post content
- [x] Update existing post content
- [x] Delete post content

### Technical Requirements ✅

- [x] Pure JavaScript (ES6 modules)
- [x] JWT token and API key authentication
- [x] localStorage for token management
- [x] JSDoc documentation
- [x] Object destructuring
- [x] Modular code structure
- [x] Responsive design with Bootstrap

## Project Structure

```
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # Custom CSS styles
├── js/
│   ├── main.js           # Main application file
│   ├── api/
│   │   ├── config.js     # API configuration
│   │   ├── auth.js       # Authentication service
│   │   └── posts.js      # Posts service
│   └── utils/
│       └── ui.js         # UI utilities
├── .gitignore            # Git ignore file
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- A valid @noroff.no or @stud.noroff.no email address
- Modern web browser with JavaScript enabled
- Internet connection for API access

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. Switch to the js2 branch:

   ```bash
   git checkout js2
   ```

3. Open `index.html` in your web browser or serve it using a local server:

   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (if you have http-server installed)
   npx http-server

   # Using PHP
   php -S localhost:8000
   ```

4. Navigate to the served URL (typically `http://localhost:8000`)

### Usage

1. **Registration**: Create a new account using your Noroff email address
2. **Login**: Sign in with your credentials
3. **Browse Posts**: View the social media feed
4. **Search**: Use the search bar to find specific posts
5. **Filter**: Filter posts by "All Posts", "My Posts", or "Following"
6. **Create Posts**: Click "New Post" to create content
7. **Edit/Delete**: Manage your own posts using the edit/delete buttons

## API Integration

This application integrates with the [Noroff API v2](https://docs.noroff.dev/docs/v2) Social endpoints:

- **Authentication**: `/auth/register`, `/auth/login`, `/auth/create-api-key`
- **Posts**: `/social/posts` with full CRUD operations
- **Search**: `/social/posts/search`

## Development

### Architecture

The application follows a modular architecture with clear separation of concerns:

- **API Layer**: Handles all external API communication
- **UI Layer**: Manages user interface interactions and updates
- **Main Application**: Coordinates between different modules

### Key JavaScript Features Used

- **ES6 Modules**: For code organization and modularity
- **Async/Await**: For handling asynchronous API calls
- **Destructuring**: For extracting data from objects and arrays
- **Template Literals**: For dynamic HTML generation
- **Local Storage**: For persistent authentication state
- **Event Delegation**: For efficient event handling

### JSDoc Documentation

The codebase includes comprehensive JSDoc documentation, especially in the `AuthService` class which demonstrates:

- Parameter type definitions
- Return type specifications
- Detailed descriptions
- Usage examples
- Error handling documentation

Example:

```javascript
/**
 * Register a new user account
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email (must be @noroff.no or @stud.noroff.no)
 * @param {string} userData.password - User's password (minimum 8 characters)
 * @returns {Promise<Object>} Registration response from API
 * @throws {Error} Throws error if registration fails
 */
```

## Security Considerations

- JWT tokens are stored in localStorage
- API keys are automatically generated and stored
- Email validation ensures only Noroff domains are accepted
- Input validation and sanitization
- Error handling for failed API requests

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

### External Libraries

- **Bootstrap 5.3.0**: For responsive UI components
- **Font Awesome 6.4.0**: For icons

### Development Dependencies

None - Pure vanilla JavaScript implementation

## Contributing

1. Create a feature branch from `js2`
2. Make your changes
3. Test thoroughly
4. Submit a pull request to `js2` branch

## License

This project is for educational purposes as part of the Noroff JavaScript 2 course assignment.

## API Reference

For detailed API documentation, visit: [Noroff API v2 Documentation](https://docs.noroff.dev/docs/v2)

## Troubleshooting

### Common Issues

1. **Login fails**: Ensure you're using a valid @noroff.no or @stud.noroff.no email
2. **Posts don't load**: Check browser console for API errors
3. **Search not working**: Ensure you're logged in and have a valid API key
4. **Images not loading**: Verify media URLs are accessible

### Support

For technical support, refer to the course materials or contact your instructor.
