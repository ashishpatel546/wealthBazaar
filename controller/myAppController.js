const fs = require('fs')
const nodemailer = require('nodemailer')
const sendGridTransport = require('nodemailer-sendgrid-transport')
const Service = require('../models/service')
const IPO = require('../models/IPO')
const {validationResult}= require('express-validator')

const transporter = nodemailer.createTransport(sendGridTransport({
    auth:{
        api_key: ""
    }
    
}))
// const transporter = nodemailer.createTransport(sendGridTransport({
//     auth:{
//         api_key: `${process.env.SENDGRID_KEY}`
//     }
// }))


exports.getIndex = (req, res, next)=>{
    const renderData = {
        title: 'Home'
    }
    res.render('app/index', renderData)
}

exports.getAllServices = async(req, res, next)=>{
    const services = await Service.find()
    const renderData = {
        title: 'Services',
        services: services
    }
    res.render('app/services', renderData)
}

exports.serveServicePage = async(req, res, next)=>{
    const serviceName = req.params.serviceName;
    // print(serviceName)
    const service = await Service.findOne({name: serviceName})
    // console.log(service)
    const renderData = {
        title: service.title,
        service: service
    }
    if (serviceName === 'mutualfund'){
        res.render('services/mutualFund', renderData)
    }
    else if(serviceName === 'loan'){
        res.render('services/loan', renderData)
    }
    else if(serviceName === 'creditcard'){
        res.render('services/creditCard', renderData)
    }
    else if(serviceName === 'insurance'){
        res.render('services/insurance', renderData)
    }
    else if(serviceName === 'corporatefunding'){
        res.render('services/corporateFunding', renderData)
    }
    else if(serviceName === 'realstate'){
        res.render('services/realState', renderData)
    }
    else if(serviceName === 'preipo'){
        const ipo_list = await IPO.find()
        renderData.IPOs = ipo_list
        res.render('services/preIPO', renderData)
    }
    else if(serviceName === 'investment'){
        const ipo_list = await IPO.find()
        renderData.IPOs = ipo_list
        res.render('services/investment', renderData)
    }
    else if(serviceName === 'wbacademy'){
        const ipo_list = await IPO.find()
        renderData.IPOs = ipo_list
        res.render('services/wbAcademy', renderData)
    }
    else{
        const error = new Error('Not Found')
        return next(error)
    }
}

exports.whyUs = (req, res, next)=>{
    const renderData = {
        title: 'Whu Us?'
    }
    res.render('app/why-us', renderData)
}

exports.aboutUs = (req, res, next)=>{
    const renderData = {
        title: 'About Us'
    }
    res.render('app/about-us', renderData)
}
exports.contactUs = (req, res, next)=>{
    const message = req.flash('message')
    // console.log(message)
    const renderData = {
        title: 'About Us',
        validationErrors: [],
        oldInput: {email: ""},
        message: message.length>0 ? message[0]: null
    }
    res.render('app/contact-us', renderData)
}

exports.postContactMessage = (req, res, next)=>{
    const {name, email, phone, query_type, message} = req.body
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const renderData = {
            validationErrors: errors.array(),
            oldInput: {email: email, name: name, phone: phone, message: message, query_type: query_type},
            title: 'Contact Us'
        }
        return res.status(422).render('app/contact-us', renderData)
    }
    req.flash('message', 'Your Message is sent succesfully. Our representative will conact you soon.')
    res.redirect('/contact-us')
        try {
            transporter.sendMail({
                to: email,
                from: 'ashish.kumar@giitian.com',
                subject: 'Your Query is submitted Successfully',
                html: `<div><h2>Thanks for submitting your query</h2><p>One of our representative will contact you soon</p></div>`,
            })
            transporter.sendMail({
                to: email,
                from: 'ashish.kumar@giitian.com',
                subject: 'Your Query is submitted Successfully',
                html: `<div><h2>Thanks for submitting your query</h2><p>Following query is submitted</p> <br/>
                <h5>Name: </h5> ${name},
                <h5>Email: </h5> ${email},
                <h5>Phone No.: </h5> ${phone},
                <h5>Query About: </h5> ${query_type},
                <h5>User Message: </h5> ${message},
    
                </div>`,
            })
        } catch (error) {
            console.log(error)
        }
}

exports.dashboard= (req, res, next)=>{
    const renderData = {
        title: 'Dashboard'
    }
    res.render('app/dashboard', renderData)
}