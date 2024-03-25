const {check} = require('express-validator');

exports.signUpValidation=[
    check('name','Name is required').not().isEmpty(),
    check('email','Please enter valid email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password','Password should be minimum of 6 chars').isLength({min:6}),
    check('image').custom((value,{req})=>{
        console.log("REQ HERE IS",req.file)
        if(req.file.mimetype == 'image/jpeg' || req.file.mimetype == 'image/png'){
          return true;
        }else{
            return false;
        }
    }).withMessage('Please upload and image type PNG,JPG')

]

exports.loginValidation =[
    check('email','Please enter valid email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password','Password is required').isLength({min:6}),
]