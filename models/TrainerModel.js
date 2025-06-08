const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const trainerSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: { type: String },
  expertise: [{ type: String }],
  socialLinks: {
    instagram: { type: String },
    youtube: { type: String }
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  videos:  [{ type: String, ref: 'Video' }], 
  workouts: [{ type: String, ref: 'Workout' }],
  dietPlans: [{ type: String, ref: 'DietPlan' }]


});


module.exports = mongoose.model('Trainer', trainerSchema);
