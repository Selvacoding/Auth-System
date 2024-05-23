const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// View profile
router.get('/me', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Edit profile
router.put('/me', ensureAuthenticated, upload.single('photo'), async (req, res) => {
  const { name, bio, phone, email, password, isPublic } = req.body;
  const updatedData = { name, bio, phone, email, isPublic };

  if (password) {
    const salt = await bcrypt.genSalt(10);
    updatedData.password = await bcrypt.hash(password, salt);
  }

  if (req.file) {
    updatedData.photo = req.file.path;
  }

  try {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updatedData }, { new: true });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// View public profiles
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isPublic: true }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
