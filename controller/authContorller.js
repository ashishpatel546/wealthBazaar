const print = require('../util/helpers')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendGridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')
const {validationResult} = require('express-validator')

const transporter = nodemailer.createTransport(sendGridTransport({
    auth:{
        api_key: `${process.env.SENDGRID_KEY}`
    }
}))

exports.getSignUpPage = (req, res, next)=>{
    const renderData = {
        // errorMessage: message.length>0 ?   message[0]: null,
        validationErrors: [],
        title: 'Sign Up',
        oldInput: {email: ""}
        }
    
    res.render('auth/signup', renderData)
}

exports.signUp= async(req, res, next)=>{
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const mobile = req.body.mobile

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const renderData = {
            validationErrors: errors.array(),
            oldInput: {email: email, name: name, mobile: mobile},
            title: 'Sign Up'
        }
        return res.status(422).render('auth/signup', renderData)
    }
 
    try {
        try {
            await User.create({email, name, mobile, password: await bcrypt.hash(password,12)})            
        } catch (err) {
            return next(err)           
        }
        res.redirect('/login')
        transporter.sendMail({
            to: email,
            from: 'ashish.kumar@giitian.com',
            subject: 'Sign Up Succeeded',
            html: `<div><h2>Congratulations</h2><p>Try to Login Your Account. Your User Name: ${email}</p></div>`,
        })
    } catch (error) {
        print(error)
        return res.redirect('/login')
    }  
}

exports.getLoginPage = (req, res, next)=>{
    const msg = req.flash('error') 
    const renderData = {
        title: 'Login',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: msg.length>0 ?   msg[0]: null
        }
    
    res.render('auth/login', renderData)
}

exports.getLogin = async(req, res, next)=>{
    
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({email: email})
    if(!user) {
        req.flash('error', 'User Not Found')
        return res.redirect('/login')  
    } 
    const doPasswordMatch = await bcrypt.compare(password, user.password)
    if(!doPasswordMatch){
        req.flash('error', 'Wrong Password')
        return res.redirect('/login')
    }

    req.session.isLoggedIn = true
    req.session.user = user;
    req.session.save((err)=>{
        if(err) print(err)
        req.flash('error', 'Logged in successfully')
        res.redirect('/dashboard')
    }) 
}

exports.logout = (req, res, next)=>{
    req.session.destroy((err)=>{
        if(err) print(err)
        res.redirect('/')
    })
}

exports.getResetPage  = async(req, res, next)=>{
    const message = req.flash('error')
    const data = {
        errorMessage: message.length>0 ?   message[0]: null,
        title: 'Password Reset',   
    }
    res.render('auth/reset', data)
}

exports.resetPasswordLink = async(req, res, next)=>{
    const email = req.body.email
    try {
        const user = await User.findOne({email: email})
        if(!user){
            req.flash('error', 'Email not found')
            return res.redirect('/reset')
        }
        const token = crypto.randomBytes(32).toString('hex')
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + (15*60*1000)
        await user.save()
        req.flash('error', 'Password reset link (valid for 10 minutes only) has been sent to your mail. Check your inbox')
        res.redirect('/login')
            transporter.sendMail({
                to: email,
                from: 'ashish.kumar@giitian.com',
                subject: 'Reset Password',
                html: `<div><h2>Click the link to reset password</h2>
                <br>
                <a href="${process.env.HOST}/reset/${token}">Reset Password</a> <br>
                <p>Or copy the following link into your browser </p>
                <p> ${req.protocol + '://' + req.get('host')}/reset/${token} </p>
                </div>`
            })
    } catch (err) {
        print(err)
        req.flash('error', 'Some Error Occured! Contact to our Support')
        return res.redirect('/reset')
    }
    
}

exports.getPasswordResetToken= async(req, res, next)=>{
    const token = req.params.resetToken
    try{
        const user = await User.findOne({resetToken: token, resetTokenExpiry: {$gt: Date.now()}})
        if(!user){
            req.flash('error', 'Some Error Occured. Please try again or Contact to our support team or your token expired')
            return res.redirect('/')
        }
        const data = {
            validationErrors: [],
            user_email: user.email,
            resetToken : token,
            title: "Update Password"  
        }
        res.render('auth/updatePassword', data)
    }
    catch(error){
        return next(error)
    }
}

exports.resetPasswordGeneration = async(req, res, next)=>{
    const email= req.body.user_email
    const resetToken = req.body.resetToken

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const renderData = {
            validationErrors: errors.array(),
            user_email: email,
            resetToken: resetToken,
            title: 'Update Password',
            isAuthenticated: req.session.isLoggedIn
        }
        return res.status(422).render('auth/updatePassword', renderData)
    }
   
    const user = await User.findOne({
        email: email,
        resetToken: resetToken,
        resetTokenExpiry: {$gt: Date.now()}
    })
    if(!user){
        req.flash('error', 'Some Error Occured. Please try again or Contact to our support team')
        return res.redirect('/')
    }
    const password = req.body.password
    try {
        user.password = await bcrypt.hash(password,12)
        user.resetToken = undefined
        user.resetTokenExpiry =  undefined
        try {
            await user.save()
            req.flash('error', 'Password Changed Successfully')
            return res.redirect('/login')
        } catch (error) {
            print(error)
            req.flash('error', 'Some Error Occured. Please try again or Contact to our support team')
            return res.redirect('/')
        }
    
    } catch (error) {
        print(error)
        req.flash('error', 'Some Error Occured. Please try again or Contact to our support team')
        return res.redirect('/')
    }    
}





