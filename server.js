const express = require('express');
const cors = require('cors');
const authenticateRoute = require('./api/authenticate');
const registerRoute = require('./api/register');
const postRoute = require('./api/posts');
const userRoute = require('./api/users');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/authenticate', authenticateRoute); // Login route
app.use('/api/register', registerRoute);         // Signup route
app.use('/api/posts', postRoute);                // Posts route
app.use('/api/users', userRoute); 
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
