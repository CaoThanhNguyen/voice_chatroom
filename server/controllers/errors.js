function handleError(err, req, res, url) {
    for(var key in err.errors) {
        req.flash("errors", err.errors[key].message)
    }
    res.redirect(url)
}

module.exports = handleError;