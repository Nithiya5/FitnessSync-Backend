const Trainer = require('../models/TrainerModel');
const User = require('../models/UserModel');
const Video = require('../models/VideoModel');
const Workout = require('../models/WorkoutModel');
const DietPlan = require('../models/DietModel');

const setUpProfile = async (req, res) => {
  try {
    const { bio, expertise, socialLinks } = req.body;

    if (req.user.role !== 'trainer') {
      return res.status(403).json({ error: 'Only trainers can set up a trainer profile' });
    }

    const trainer = await Trainer.findOne({ user: req.user.id });
    if (!trainer) {
      return res.status(404).json({ error: 'Trainer profile not found' });
    }

// Get user to sync UUID
const user = await User.findById(req.user.id);
if (!trainer.uuid || trainer.uuid !== user.uuid) {
  trainer.uuid = user.uuid; // ✅ Sync UUIDs
}


    // Update profile fields
    if (bio) trainer.bio = bio;
    if (Array.isArray(expertise)) trainer.expertise = expertise;
    if (socialLinks && typeof socialLinks === 'object') {
      trainer.socialLinks.instagram = socialLinks.instagram || trainer.socialLinks.instagram;
      trainer.socialLinks.youtube = socialLinks.youtube || trainer.socialLinks.youtube;
    }

    await trainer.save();

    res.status(200).json({
      message: 'Trainer profile updated successfully',
      profile: trainer
    });

  } catch (error) {
    console.error('Error setting up profile:', error.message);
    res.status(500).json({ error: 'Server error while setting up profile' });
  }
};




// @desc    Get trainer profile by user's UUID
const getTrainerProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uuid: req.user.uuid });
    if (!user) return res.status(404).json({ message: "User not found" });

    const trainer = await Trainer.findOne({ user: user._id }).select('bio expertise socialLinks');

    if (!trainer) return res.status(404).json({ message: "Trainer profile not found" });

    res.status(200).json(trainer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const updateTrainerProfile = async (req, res) => {
  try {
    const { bio, expertise, socialLinks } = req.body;

    const user = await User.findOne({ uuid: req.user.uuid });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updated = await Trainer.findOneAndUpdate(
      { user: user._id },
      { bio, expertise, socialLinks },
      { new: true }
    ).select('bio expertise socialLinks');

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

const getMyVideos = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user.id });
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

    const videos = await Video.find({ trainerUuid: trainer.uuid });
    res.status(200).json({ videos });
  } catch (error) {
    console.error('Error fetching trainer videos:', error.message);
    res.status(500).json({ error: 'Server error while fetching videos' });
  }
};

const getMyWorkouts = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user.id });
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

    const workouts = await Workout.find({ trainerUuid: trainer.uuid });
    res.status(200).json({ workouts });
  } catch (error) {
    console.error('Error fetching trainer workouts:', error.message);
    res.status(500).json({ error: 'Server error while fetching workouts' });
  }
};


const getMyDietPlans = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user.id });
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

    const dietPlans = await DietPlan.find({ trainerUuid: trainer.uuid });
    res.status(200).json({ dietPlans });
  } catch (error) {
    console.error('Error fetching trainer diet plans:', error.message);
    res.status(500).json({ error: 'Server error while fetching diet plans' });
  }
};


module.exports = {
  getTrainerProfile,
  updateTrainerProfile,
  setUpProfile,
  getMyVideos,
  getMyWorkouts,
  getMyDietPlans
};
