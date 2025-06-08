const Trainee = require('../models/TraineeModel');
const Trainer = require('../models/TrainerModel');
const Workout = require('../models/WorkoutModel');
const Video = require('../models/VideoModel');
const DietPlan = require('../models/DietModel');
const User = require('../models/UserModel');



const toggleFollowTrainer = async (req, res) => {
  try {
    const { trainerUuid } = req.body;
    const trainee = await Trainee.findOne({ user: req.user.id });
    const trainer = await Trainer.findOne({ uuid: trainerUuid });

    if (!trainee || !trainer) {
      return res.status(404).json({ error: 'Trainee or Trainer not found' });
    }

    const alreadyFollowing = trainee.followedTrainers.includes(trainerUuid);

    if (alreadyFollowing) {
      // Unfollow
      trainee.followedTrainers = trainee.followedTrainers.filter(uuid => uuid !== trainerUuid);
      trainer.followers = trainer.followers.filter(id => id.toString() !== req.user.id);
      await trainee.save();
      await trainer.save();
      return res.status(200).json({ message: 'Trainer unfollowed', followed: false });
    } else {
      // Follow
      trainee.followedTrainers.push(trainerUuid);
      trainer.followers.push(req.user.id);
      await trainee.save();
      await trainer.save();
      return res.status(200).json({ message: 'Trainer followed', followed: true });
    }
  } catch (error) {
    console.error('Follow toggle error:', error.message);
    res.status(500).json({ error: 'Server error while toggling follow' });
  }
};

// Get trainee profile
const getProfile = async (req, res) => {
  try {
    const trainee = await Trainee.findOne({ user: req.user.id }).populate('user');
    if (!trainee) return res.status(404).json({ error: 'Trainee profile not found' });

    res.status(200).json({ profile: trainee });
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
};

// Edit trainee profile
// controllers/traineeController.js
const updateProfile = async (req, res) => {
  try {
    const { goals, interests, traineeLevel, progress } = req.body;

    // 1. Locate the trainee by User ObjectId
    const trainee = await Trainee.findOne({ user: req.user.id });
    if (!trainee) {
      return res.status(404).json({ error: 'Trainee profile not found' });
    }

    // 2. Top-level profile fields
    if (goals !== undefined) trainee.goals = goals;
    if (Array.isArray(interests)) trainee.interests = interests;
    if (traineeLevel) trainee.traineeLevel = traineeLevel;

    // 3. Progress block
    if (progress) {
      // Accept only weight & height from client — ignore bmi
      const { weight, height } = progress;

      if (typeof weight === 'number') trainee.progress.weight = weight;
      if (typeof height === 'number') trainee.progress.height = height;

      // --- Recalculate BMI whenever we have both weight & height ---
      const w = trainee.progress.weight;
      const hRaw = trainee.progress.height;

      if (typeof w === 'number' && typeof hRaw === 'number' && hRaw > 0) {
        const hMeters = hRaw > 3 ? hRaw / 100 : hRaw; // >3 ==> assume cm
        const bmi = parseFloat((w / (hMeters * hMeters)).toFixed(1));
        trainee.progress.bmi = bmi;
      }

      trainee.progress.lastUpdated = Date.now();
    }

    // 4. Persist & respond
    await trainee.save();
    res.status(200).json({
      message: 'Profile updated successfully',
      profile: trainee
    });
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
};

const toggleLikeWorkout = async (req, res) => {
  try {
    const { workoutUuid } = req.body;
    const trainee = await Trainee.findOne({ user: req.user.id });
    const workout = await Workout.findOne({ uuid: workoutUuid });

    if (!trainee || !workout) 
      return res.status(404).json({ error: 'Trainee or Workout not found' });

    const likedIndexInTrainee = trainee.savedWorkouts.indexOf(workoutUuid);
    const likedIndexInWorkout = workout.likes.indexOf(trainee.uuid);

    if (likedIndexInTrainee === -1) {
      // Not liked yet, add like
      trainee.savedWorkouts.push(workoutUuid);
      workout.likes.push(trainee.uuid);
    } else {
      // Already liked, remove like
      trainee.savedWorkouts.splice(likedIndexInTrainee, 1);
      if (likedIndexInWorkout !== -1) {
        workout.likes.splice(likedIndexInWorkout, 1);
      }
    }

    await trainee.save();
    await workout.save();

    res.status(200).json({ message: likedIndexInTrainee === -1 ? 'Workout liked' : 'Workout unliked' });
  } catch (error) {
    console.error('Error toggling like on workout:', error.message);
    res.status(500).json({ error: 'Server error while toggling like on workout' });
  }
};

const toggleLikeVideo = async (req, res) => {
  try {
    const { videoUuid } = req.body;
    const trainee = await Trainee.findOne({ user: req.user.id });
    const video = await Video.findOne({ uuid: videoUuid });

    if (!trainee || !video) 
      return res.status(404).json({ error: 'Trainee or Video not found' });

    const likedIndexInTrainee = trainee.likedVideos.indexOf(videoUuid);
    const likedIndexInVideo = video.likes.indexOf(trainee.uuid);

    if (likedIndexInTrainee === -1) {
      trainee.likedVideos.push(videoUuid);
      video.likes.push(trainee.uuid);
    } else {
      trainee.likedVideos.splice(likedIndexInTrainee, 1);
      if (likedIndexInVideo !== -1) {
        video.likes.splice(likedIndexInVideo, 1);
      }
    }

    await trainee.save();
    await video.save();

    res.status(200).json({ message: likedIndexInTrainee === -1 ? 'Video liked' : 'Video unliked' });
  } catch (error) {
    console.error('Error toggling like on video:', error.message);
    res.status(500).json({ error: 'Server error while toggling like on video' });
  }
};


const toggleLikeDietPlan = async (req, res) => {
  try {
    const { dietUuid } = req.body;
    const trainee = await Trainee.findOne({ user: req.user.id });
    const dietPlan = await DietPlan.findOne({ uuid: dietUuid });

    if (!trainee || !dietPlan) 
      return res.status(404).json({ error: 'Trainee or Diet Plan not found' });

    const likedIndexInTrainee = trainee.savedDietPlans.indexOf(dietUuid);
    const likedIndexInDiet = dietPlan.likes.indexOf(trainee.uuid);

    if (likedIndexInTrainee === -1) {
      trainee.savedDietPlans.push(dietUuid);
      dietPlan.likes.push(trainee.uuid);
    } else {
      trainee.savedDietPlans.splice(likedIndexInTrainee, 1);
      if (likedIndexInDiet !== -1) {
        dietPlan.likes.splice(likedIndexInDiet, 1);
      }
    }

    await trainee.save();
    await dietPlan.save();

    res.status(200).json({ message: likedIndexInTrainee === -1 ? 'Diet plan liked' : 'Diet plan unliked' });
  } catch (error) {
    console.error('Error toggling like on diet plan:', error.message);
    res.status(500).json({ error: 'Server error while toggling like on diet plan' });
  }
};

// View all content
const viewAllWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({});
    res.status(200).json({ workouts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
};

const viewAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({});
    res.status(200).json({ videos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

const viewAllDietPlans = async (req, res) => {
  try {
    const dietPlans = await DietPlan.find({});
    res.status(200).json({ dietPlans });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diet plans' });
  }
};

module.exports = {
  toggleFollowTrainer,
  getProfile,
  updateProfile,
  toggleLikeWorkout,
  toggleLikeVideo,
  toggleLikeDietPlan,
  viewAllWorkouts,
  viewAllVideos,
  viewAllDietPlans
};
