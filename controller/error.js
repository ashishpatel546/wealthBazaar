exports.get404 = (req, res, next)=> {
    res.render('404', {isAuthenticated: req.session.isLoggedIn, title: '404', isAdmin: req.isAdmin })
}
exports.get505 = (req, res, next)=> {
    res.render('505', {isAuthenticated: req.session.isLoggedIn, title: '505', isAdmin: req.isAdmin })
}