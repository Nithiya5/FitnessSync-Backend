const User = require('../models/UserModel');
const Trainer = require('../models/TrainerModel');
const Trainee = require('../models/TraineeModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// @desc    Register Trainer or Trainee
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).send("Please enter all required fields");
    }

    const allowedRoles = ['trainer', 'trainee'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).send("Invalid role. Only trainer or trainee can register.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists with this email");
    }


    const newUser = new User({
      name,
      email,
      password,
      role
    });

    await newUser.save();

    // 🔁 Create corresponding trainer or trainee document
    if (role === 'trainer') {
     await Trainer.create({ 
        user: newUser._id,
        uuid: newUser.uuid // ✅ Ensures uuid is same as in User
     });
 // uuid auto-generated
    } else if (role === 'trainee') {
      await Trainee.create({ 
        user: newUser._id,
        uuid: newUser.uuid // ✅ Ensures uuid is same as in User
});
 // uuid auto-generated
    }

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send("An error occurred during registration");
  }
};

// @desc    Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Please provide email and password");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send("An error occurred during login");
  }
};

module.exports = {
  register,
  login
};
