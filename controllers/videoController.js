const Video = require('../models/VideoModel');
const Trainer = require('../models/TrainerModel');
const cloudinary = require('../utils/cloudinary');

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const trainer = await Trainer.findOne({ uuid: req.user.uuid });
    if (!trainer) return res.status(404).json({ error: 'Trainer profile not found' });

    const video = new Video({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      videoUrl: req.file.path,
      publicId: req.file.filename,
      trainerUuid: trainer.uuid
    });

    await video.save();

    // Optionally push the video reference to Trainer.videos if needed
    trainer.videos.push(video.uuid);
    await trainer.save();

    res.status(201).json({
      message: 'Video uploaded to Cloudinary successfully',
      video
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const editVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, category } = req.body;

    const video = await Video.findOne({ uuid: videoId });
    if (!video) return res.status(404).json({ error: 'Video not found' });

    if (video.trainerUuid !== req.user.uuid) {
      return res.status(403).json({ error: 'Unauthorized to edit this video' });
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.category = category || video.category;

    await video.save();
    res.status(200).json(video);
  } catch (error) {
    console.error('Edit video error:', error);
    res.status(500).json({ error: 'Failed to edit video' });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOne({ uuid: req.params.id });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.trainerUuid !== req.user.uuid) {
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own videos' });
    }

    await cloudinary.uploader.destroy(video.publicId, {
      resource_type: 'video'
    });

    await video.deleteOne();

    await trainer.updateOne({ $pull: { videos: video.uuid } });


    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  uploadVideo,
  editVideo,
  deleteVideo,
};
