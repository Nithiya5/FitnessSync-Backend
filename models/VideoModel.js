const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const videoSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  title: String,
  description: String,
  videoUrl: String,
  publicId: { type: String, required: true },

  trainerUuid: { type: String, required: true, ref: 'Trainer' }, // 👈 Changed
  uploadedAt: { type: Date, default: Date.now },

  likes: [{ type: String, ref: 'Trainee' }], // 👈 Changed to user UUIDs

  category: {
    type: String,
    enum: [
      'Weight Training',
      'Yoga',
      'Cardio',
      'Pilates',
      'CrossFit',
      'HIIT',
      'Stretching',
      'Dance'
    ],
    required: true
  }
});

module.exports = mongoose.model('Video', videoSchema);
