const express = require('express');
const router = express.Router();
const { addDietPlan, editDietPlan, deleteDietPlan,toggleLikeDiet } = require('../controllers/dietController');
const {auth,authorizeRoles} = require('../middleware/auth');

// Add diet plan (trainer must be logged in)
router.post('/upload', auth, authorizeRoles('trainer'), addDietPlan);

// 🟡 Edit diet plan by dietUuid
router.put('/diet/:uuid', auth, authorizeRoles('trainer'), editDietPlan);

// 🔴 Delete diet plan by dietUuid
router.delete('/diet/:uuid', auth, authorizeRoles('trainer'), deleteDietPlan);

// 💙 Like/unlike diet plan — accessible to any logged-in user (trainee or trainer)
router.put('/diet/:uuid/like', auth, toggleLikeDiet);



module.exports = router;
