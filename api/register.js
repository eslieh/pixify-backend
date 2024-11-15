const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Route for user registration
router.post('/', async (req, res) => {
  const { username, fullName, password, profileUrl } = req.body;

  try {
    // Ensure the correct path to db.json
    const filePath = path.join(__dirname, '..', 'db.json');
    
    // Read the current data
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    // Check if user already exists
    const existingUser = jsonData.users.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new user object
    const newUser = {
      username,
      fullnames: fullName,
      password,
      profile_url: profileUrl,
      followers: [],
      following: []
    };

    // Add the new user to the users array
    jsonData.users.push(newUser);

    // Save the updated data back to db.json
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));

    // Respond with the new user info
    res.status(201).json({ message: 'Account created successfully', user: newUser });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
