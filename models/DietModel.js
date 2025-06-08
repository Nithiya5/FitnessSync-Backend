const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const DietPlanSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true }, // ⬅ UUID corrected
  trainerUuid: { type: String, required: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Mediterranean', 'Low Carb', 'High Protein'],
    required: true
  },
  meals: [
    {
      time: { type: String, required: true },
      food: { type: String, required: true },
      calories: { type: Number, required: true }
    }
  ],
  notes: { type: String },
  likes: [{ type: String, ref: 'Trainee' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DietPlan', DietPlanSchema);
