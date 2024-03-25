const {check} = require('express-validator');

exports.signUpValidation=[
    check('name','Name is required').not().isEmpty(),
    check('email','Please enter valid email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password','Password should be minimum of 6 chars').isLength({min:6})
]