const print = require('../util/helpers')
const User = require('../models/user')
const IPO = require('../models/IPO')
const Service = require('../models/service')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendGridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')
const {validationResult} = require('express-validator')
const fileHelper = require('../util/fileHelper')
const path = require('path')

const transporter = nodemailer.createTransport(sendGridTransport({
    auth:{
        api_key: "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"
    }
}))

exports.getLoginPage = (req, res, next)=>{
    const renderData = {
        title: 'Admin Login'
        }
    
    res.render('admin/adminLogin', renderData)
}

exports.getSignUpPage = (req, res, next)=>{
    // value = "<%= oldInput.email %>"
    const renderData = {
        // errorMessage: message.length>0 ?   message[0]: null,
        validationErrors: [],
        title: 'Sign Up',
        oldInput: {email: ""},
        isAuthenticated: req.session.isLoggedIn
        }
    
    res.render('admin/adminSignUp', renderData)
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
            title: 'Sign Up',
            isAuthenticated: req.session.isLoggedIn
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

exports.dashboard = (req,res, next)=>{
    const renderData = {
        title: "admin-Dashboard"
    }
    res.render('admin/adminDash', renderData)
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
        res.redirect('/admin/dashboard')
    }) 
}

exports.addService = (req, res, next)=>{
    const message = req.flash('error')
    const renderData={
        title: 'Add Service',
        errorMessage: message.length>0 ?   message[0]: null
    }
    res.render('admin/add-service', renderData)
}

exports.postAddService= async(req, res, next)=>{
    const title = req.body.title;
    const image = req.file;
    const name = req.body.name;
    const description = req.body.description;

    if(!image){
        req.flash('error', 'Image Uploading Problem')
        return res.redirect('/admin/add-service')
    }

    const newService = new Service({title,name, description, image_url:image.path});
    try {
        await newService.save()
        res.redirect('/admin/dashboard')

    } catch (error) {
        return next(error)
    }
}

exports.services = async(req, res, next)=>{
    try {
        const services = await Service.find()
        const renderData={
            title: 'Services',
            services: services
        }
        res.render('admin/services', renderData)
        
    } catch (error) {
        return next(error)
    }
    
}

exports.getEditService = async(req, res, next)=>{
    const serviceId = req.params.serviceId;
        try {
            const service = await Service.findOne({_id: serviceId});
            const message = req.flash('error')
            const renderData={
                title: 'Edit Service',
                errorMessage: message.length>0 ?   message[0]: null,
                service: service
            }
        res.render('admin/edit-service', renderData)

    } catch (error) {
        return next(error)
    }
}

exports.postUpdateService = async(req, res, next)=>{
    const serviceId = req.body._id
    const title = req.body.title;
    const image = req.file;
    const name = req.body.name
    const description = req.body.description;


    // print(service)
    const service = await Service.findOne({_id : serviceId})
    if(image){
        const imgPath =  service.image_url
        const oldImagePath = path.join(__dirname,'../', imgPath)
        fileHelper.deleteFile(oldImagePath)
        service.image_url = image.path
    }

    service.title = title
    service.description = description
    service.name = name;
    await service.save()
    
    res.redirect('/admin/services')
}

exports.deleteService = async (req, res, next)=>{
    const serviceId = req.params.serviceId
    try{
    const service = await Service.findOne({_id : serviceId})
    const image_url =  service.image_url
    const oldImagePath = path.join(__dirname, '../' ,image_url)
    fileHelper.deleteFile(oldImagePath)
    }catch(err){
        return next(err)
    }
    Service.findByIdAndDelete(serviceId)
    .then(result=>{
        // print(result) 
        res.redirect('/admin/services')
    })
    .catch(err=>print(err))
}

exports.getAddIPO = (req, res, next)=>{
    const message = req.flash('error')
    const renderData={
        title: 'Add IPO',
        errorMessage: message.length>0 ?   message[0]: null
    }
    res.render('admin/addIPO', renderData)
}

exports.postAddIPO = async(req, res, next)=>{
    const {script_name, buying_price, selling_price, description} = req.body
    const newIPO = new IPO({script_name, buying_price, selling_price, description})
    try {
        await newIPO.save()
        res.redirect('/admin/ipo-list')

    } catch (error) {
        return next(error)
    }
}

exports.showIPOs = async(req, res, next)=>{
    try {
        const ipo_list = await IPO.find()
        const renderData={
            title: 'Services',
            IPOs: ipo_list
        }
        res.render('admin/ipo-list', renderData)
        
    } catch (error) {
        return next(error)
    }
}

