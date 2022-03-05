const express = require('express')
const {body} = require('express-validator')
const isAdmin = require('../middlewares/isAdmin')
const adminController = require('../controller/adminController')
const User = require('../models/user')


const router = express.Router()


router.get('/signup', adminController.getSignUpPage )

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
    adminController.signUp)

router.get('/login', adminController.getLoginPage)

router.post('/login', adminController.getLogin)

router.get('/dashboard',isAdmin, adminController.dashboard )

router.get('/add-service', isAdmin, adminController.addService)

router.post('/add-service', isAdmin, adminController.postAddService)

router.get('/services', isAdmin, adminController.services)

router.get('/service/:serviceId', isAdmin, adminController.getEditService)

router.post('/update-service', isAdmin, adminController.postUpdateService)

router.get('/delete-service/:serviceId', isAdmin, adminController.deleteService)

router.get('/addIPO',isAdmin, adminController.getAddIPO)

router.post('/addIPO',isAdmin, adminController.postAddIPO)

router.get('/IPO-list', isAdmin, adminController.showIPOs)



module.exports = router