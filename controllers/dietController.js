const  DietPlan  = require('../models/DietModel');
const Trainer = require('../models/TrainerModel');

// Add new diet plan
const addDietPlan = async (req, res) => {
  try {
    // Extract data from body
    const { title, category, meals, notes } = req.body;

    if (!title || !category || !meals) {
      return res.status(400).json({ error: 'Title, category, and meals are required' });
    }

    // Use authenticated user's UUID
    const trainerUuid = req.user.uuid;

    // Create new diet plan
    const dietPlan = new DietPlan({
      trainerUuid,
      title,
      category,
      meals,
      notes,
      likes: []
    });

    await dietPlan.save();

    // Add dietPlan UUID to the trainer
    const trainer = await Trainer.findOne({ uuid: trainerUuid });
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

    trainer.dietPlans.push(dietPlan.uuid);
    await trainer.save();

    res.status(201).json({ message: 'Diet plan added successfully', dietPlan });
  } catch (error) {
    console.error('Error adding diet plan:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};


// Edit diet plan
const editDietPlan = async (req, res) => {
  try {
    const { dietUuid } = req.params;

    const dietPlan = await DietPlan.findOne({ dietUuid });
    if (!dietPlan) {
      return res.status(404).json({ error: 'Diet plan not found' });
    }

    const { title, category, meals, notes } = req.body;

    if (title) dietPlan.title = title;
    if (category) dietPlan.category = category;
    if (meals) dietPlan.meals = meals;
    if (notes) dietPlan.notes = notes;

    await dietPlan.save();
    res.status(200).json(dietPlan);
  } catch (error) {
    console.error('Error editing diet plan:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Delete diet plan
const deleteDietPlan = async (req, res) => {
  try {
    const { dietUuid } = req.params;

    const dietPlan = await DietPlan.findOneAndDelete({ dietUuid });
    if (!dietPlan) {
      return res.status(404).json({ error: 'Diet plan not found' });
    }

    res.status(200).json({ message: 'Diet plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting diet plan:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Like/unlike diet plan
const toggleLikeDiet = async (req, res) => {
  try {
    const { dietUuid } = req.params;
    const userId = req.user.id;

    const dietPlan = await DietPlan.findOne({ dietUuid });
    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    const index = dietPlan.likes.indexOf(userId);

    if (index === -1) {
      dietPlan.likes.push(userId);
    } else {
      dietPlan.likes.splice(index, 1);
    }

    await dietPlan.save();

    return res.json({
      message: index === -1 ? 'Diet plan liked' : 'Diet plan unliked',
      likesCount: dietPlan.likes.length,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ message: 'Server error', details: error.message });
  }
};

module.exports = {
  addDietPlan,
  editDietPlan,
  deleteDietPlan,
  toggleLikeDiet
};
