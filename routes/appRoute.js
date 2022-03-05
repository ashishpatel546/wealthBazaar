const express = require('express')

const {body} = require('express-validator')

const isAuth = require('../middlewares/isAuth')
const appController = require('../controller/myAppController')
const authController = require('../controller/authContorller')
const User = require('../models/user')

const router = express.Router()


router.get('/', appController.getIndex)

router.get('/signup', authController.getSignUpPage )

router.post('/signup', [
    body('email').isEmail().withMessage('Enter a valid email!!!').custom(async(value, {req})=>{
        const user = await User.findOne({email: value})
        if(user){
            return Promise.reject("Email already exist, Please try to login or with different email")
        }
    }),
    body('password', 'Validation failed for password. Password should be alphanumeric and atleast 6 characters').isLength({min:6}).isAlphanumeric(),
    body('confirm_password').custom((value, {req})=>{
        if(value !== req.body.password){
            throw new Error("Password and Confirm Password doesn't match")
        }
        return true
    }),
    body('mobile', 'Please enter a valid mobile number').isMobilePhone()
    ],
    authController.signUp)

router.get('/login', authController.getLoginPage )

router.post('/login', authController.getLogin)

router.get('/logout', authController.logout)

router.get('/reset', authController.getResetPage)

router.post('/reset-password', authController.resetPasswordLink)

router.get('/reset/:resetToken', authController.getPasswordResetToken)

router.post('/update-password', [
    body('password', 'Validation failed for password. Password should be alphanumeric and atleast 6 characters').isLength({min:6}).isAlphanumeric(),
    body('confirm_password').custom((value, {req})=>{
        if(value !== req.body.password){
            throw new Error("Password and Confirm Password doesn't match")
        }
        return true
    })
    ] , authController.resetPasswordGeneration)


router.get('/services', appController.getAllServices)

router.get('/service/:serviceName', appController.serveServicePage)

router.get('/about-us', appController.aboutUs)

router.get('/contact-us', appController.contactUs)

router.get('/why-us', appController.whyUs)

// router.post('/contact-us', appController.postContactMessage)
router.post('/contact-us',[body('email', 'Email Id is not valid').isEmail(), body('phone', 'Not a valid mobile number').isMobilePhone(), body('message', 'Message must be minimum 10 character long').isLength({min:10})], appController.postContactMessage)

router.get('/dashboard',isAuth, appController.dashboard)

module.exports = router