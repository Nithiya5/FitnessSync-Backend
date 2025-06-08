const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { toggleLikeWorkout,editWorkout,addWorkout,deleteWorkout } = require('../controllers/workoutController');
const {auth,authorizeRoles} = require('../middleware/auth');

router.put('/like/:uuid', auth, authorizeRoles('trainer'),toggleLikeWorkout);
router.post('/upload', auth, upload.single('image'), authorizeRoles('trainer'), addWorkout);
router.put('/edit/:uuid', auth, authorizeRoles('trainer'), upload.single('image'),editWorkout);
router.delete('/delete/:uuid', auth, authorizeRoles('trainer'), deleteWorkout);

module.exports = router;
