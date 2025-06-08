const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Route for user signup
router.post('/signup', UserController.register);

// Route for user login
router.post('/login', UserController.login);

module.exports = router;
