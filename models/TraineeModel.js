const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const traineeSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  goals: { type: String },

  interests: [String],

  // ✅ UUID references to Trainers
  followedTrainers: [
    { type: String, ref: 'Trainer' }  // Trainer UUIDs
  ],

  // ✅ UUID references to Videos
  likedVideos: [
    { type: String, ref: 'Video' }
  ],

  // ✅ UUID references to Workouts
  savedWorkouts: [
    { type: String, ref: 'Workout' }
  ],

  // ✅ UUID references to DietPlans
  savedDietPlans: [
    { type: String, ref: 'DietPlan' }
  ],

  traineeLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },

  progress: {
    weight: Number,
    height: Number,
    bmi: Number,
    lastUpdated: { type: Date, default: Date.now }
  }
});

module.exports = mongoose.model('Trainee', traineeSchema);
