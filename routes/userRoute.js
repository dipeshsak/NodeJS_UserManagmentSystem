const express = require('express');
const { signUpValidation } = require('../helpers/validation');
const router = express.Router();
const userController = require('../controllers/userController')

router.post('/register',signUpValidation,userController.register)

module.exports = router;