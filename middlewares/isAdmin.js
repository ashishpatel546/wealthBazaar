module.exports =  (req, res, next)=>{
    if(!req.isAdmin) return res.redirect('/')
    next()
}