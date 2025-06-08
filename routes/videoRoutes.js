const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { uploadVideo,editVideo,deleteVideo } = require('../controllers/videoController');
const {auth,authorizeRoles} = require('../middleware/auth');


router.post('/upload', auth, authorizeRoles('trainer'),upload.single('video'),  uploadVideo);

router.put( '/edit/:uuid', auth,authorizeRoles('trainer'),editVideo);

router.delete( '/delete/:uuid',auth,authorizeRoles('trainer'),deleteVideo);


module.exports = router;
