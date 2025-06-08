const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/auth');
const { getTrainerProfile,setUpProfile,getMyDietPlans,getMyVideos,getMyWorkouts } = require('../controllers/trainerController');

router.put('/setup-profile', auth, authorizeRoles('trainer'), setUpProfile);
router.get('/videos', auth, authorizeRoles('trainer'), getMyVideos);
router.get('/workouts', auth, authorizeRoles('trainer'), getMyWorkouts);
router.get('/dietplans', auth, authorizeRoles('trainer'), getMyDietPlans);


router.get('/profile', auth, authorizeRoles('trainer'), getTrainerProfile);


module.exports = router;
