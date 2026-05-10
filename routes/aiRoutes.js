const express = require('express');
const { generateModelImage } = require('../controllers/aiController');
const router = express.Router();

router.post('/generate-image', generateModelImage);

module.exports = router;
