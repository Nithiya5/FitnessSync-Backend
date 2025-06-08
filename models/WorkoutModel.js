
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const workoutSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },

  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  description: { type: String },

  trainerUuid: { type: String, required: true, ref: 'Trainer' }, // ✅ UUID instead of ObjectId

  category: {
    type: String,
    enum: ['Weight Training', 'Yoga', 'Cardio', 'Pilates', 'CrossFit', 'HIIT', 'Stretching', 'Dance'],
    required: true
  },

  uploadedAt: { type: Date, default: Date.now },

  likes: [{ type: String, ref: 'Trainee' }] // ✅ UUIDs of users who liked
});

module.exports = mongoose.model('Workout', workoutSchema);
