const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Route for user authentication
router.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Ensure the correct path to db.json
    const filePath = path.join(__dirname, '..', 'db.json');
    
    // Read the users from db.json
    const data = await fs.readFile(filePath, 'utf8');
    
    // Debugging: Log the raw data
    console.log('Raw data from db.json:', data);

    // Parse the data
    const jsonData = JSON.parse(data);
    
    // Check if users exists and is an array
    if (!jsonData.users || !Array.isArray(jsonData.users)) {
      console.error('Users data is not valid');
      return res.status(500).json({ message: 'Invalid database format' });
    }

    // Debugging: Log the parsed users
    console.log('Parsed users:', jsonData.users);

    // Check if the username and password match a user
    const user = jsonData.users.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      return res.status(200).json({ message: 'Login successful', user });
    } else {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Error reading database:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
