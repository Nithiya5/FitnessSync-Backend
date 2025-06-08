const express = require('express');
const router = express.Router();
const {getProfile, updateProfile, toggleFollowTrainer, toggleLikeDietPlan,toggleLikeVideo,toggleLikeWorkout, viewAllWorkouts, viewAllVideos, viewAllDietPlans} = require('../controllers/traineeController');
const { auth,authorizeRoles } = require('../middleware/auth');

router.get('/profile', auth,authorizeRoles("trainee"), getProfile);
router.put('/edit-profile', auth,authorizeRoles("trainee"), updateProfile);
router.post('/toggle-follow', auth,authorizeRoles("trainee"), toggleFollowTrainer);

router.post('/toggle-workout', auth,authorizeRoles("trainee"), toggleLikeWorkout);
router.post('/toggle-video', auth,authorizeRoles("trainee"), toggleLikeVideo);
router.post('/toggle-diet', auth,authorizeRoles("trainee"), toggleLikeDietPlan);

router.get('/workouts', auth,authorizeRoles("trainee"), viewAllWorkouts);
router.get('/videos', auth,authorizeRoles("trainee"), viewAllVideos);
router.get('/dietplans', auth,authorizeRoles("trainee"), viewAllDietPlans);

module.exports = router;
