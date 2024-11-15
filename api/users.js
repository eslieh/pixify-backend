const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load the database (db.json)
const dbPath = path.join(__dirname, '../db.json');
const getDatabase = () => {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
};

// Route to get user data by username or suggestions
router.get('/', (req, res) => {
  const { username, suggestions, limit } = req.query;

  // If "username" query is provided, fetch user by username
  if (username) {
    const db = getDatabase();
    const user = db.users.find((user) => user.username === username);

    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  }

  // If "suggestions" query is provided, fetch user suggestions
  if (suggestions === 'true') {
    const db = getDatabase();
    const currentUsername = req.query.currentUser;  // Get current user's username from query or cookie

    // Get a random subset of users or limit by the "limit" query parameter
    const limitNumber = limit ? parseInt(limit, 10) : 4; // Default to 4 if no limit is provided

    // Filter out the current user's profile from the suggestions list
    const usersWithoutCurrentUser = db.users.filter(user => user.username !== currentUsername);

    // Simple way to get random users (you could improve this logic)
    const randomUsers = usersWithoutCurrentUser
      .sort(() => Math.random() - 0.5) // Randomize the order
      .slice(0, limitNumber); // Slice to get the number of users defined by "limit"

    return res.json(randomUsers);
  }

  // If no valid query, return an error
  return res.status(400).json({ error: 'Either username or suggestions query is required' });
});

// Route to update user data (follow user)
router.put('/:username', (req, res) => {
  const { username } = req.params;
  const updatedData = req.body;

  const db = getDatabase();
  const userIndex = db.users.findIndex((user) => user.username === username);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update the user's data
  db.users[userIndex] = updatedData;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  res.status(200).json(updatedData);
});
// Express route to search users by username
router.get('/users', (req, res) => {
  const { username } = req.query;
  if (username) {
    const db = getDatabase();
    const filteredUsers = db.users.filter(user =>
      user.username.toLowerCase().includes(username.toLowerCase())
    );
    return res.json(filteredUsers);
  }
  return res.status(400).json({ error: 'Username query is required' });
});


module.exports = router;
