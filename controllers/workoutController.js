const Workout = require('../models/WorkoutModel');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const Trainer = require('../models/TrainerModel');

const addWorkout = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { title, description, category } = req.body;
    console.log('Request body:', req.body);

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const workout = new Workout({
      title,
      description,
      category,
      imageUrl: req.file.path,      // ✅ Cloudinary gives this URL
      publicId: req.file.filename,  // ✅ Cloudinary's public ID
      trainerUuid: req.user.uuid
    });

    await workout.save();

    // Add workout UUID to trainer profile
    const trainer = await Trainer.findOne({ uuid: req.user.uuid });
    if (trainer) {
      trainer.workouts.push(workout.uuid);
      await trainer.save();
    }

    res.status(201).json({ message: 'Workout uploaded successfully', workout });
  } catch (error) {
    console.error('Workout upload error:', error);
    res.status(500).json({ error: 'Failed to upload workout' });
  }
};


// ✅ Edit Workout
const editWorkout = async (req, res) => {
  const workout = await Workout.findOne({ uuid: req.params.id });

  if (!workout) return res.status(404).json({ error: 'Workout not found' });
  if (workout.trainerUuid !== req.user.uuid) return res.status(403).json({ error: 'Unauthorized' });

  const { title, description, category } = req.body;

  if (req.file) {
    await cloudinary.uploader.destroy(workout.publicId, { resource_type: 'image' });

    const streamUpload = () => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'fitnessSync/workouts', resource_type: 'image' },
        (error, result) => (result ? resolve(result) : reject(error))
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const result = await streamUpload();
    workout.imageUrl = result.secure_url;
    workout.publicId = result.public_id;
  }

  if (title) workout.title = title;
  if (description) workout.description = description;
  if (category) workout.category = category;

  await workout.save();
  res.json(workout);
};

// ✅ Delete Workout
const deleteWorkout = async (req, res) => {
  const workout = await Workout.findOne({ uuid: req.params.id });

  if (!workout) return res.status(404).json({ error: 'Workout not found' });
  if (workout.trainerUuid !== req.user.uuid) return res.status(403).json({ error: 'Unauthorized' });

  await cloudinary.uploader.destroy(workout.publicId, { resource_type: 'image' });
  await workout.deleteOne();

  res.json({ message: 'Workout deleted successfully' });
};

// ✅ Toggle Like
const toggleLikeWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({ uuid: req.params.id });

    if (!workout) return res.status(404).json({ message: "Workout not found" });

    const userUuid = req.user.uuid;
    const index = workout.likes.indexOf(userUuid);

    if (index === -1) {
      workout.likes.push(userUuid);
    } else {
      workout.likes.splice(index, 1);
    }

    await workout.save();

    return res.json({
      message: index === -1 ? "Workout liked" : "Workout unliked",
      likesCount: workout.likes.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addWorkout,
  editWorkout,
  deleteWorkout,
  toggleLikeWorkout
};
