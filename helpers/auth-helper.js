function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // not authenticated, store calling url in session for a redirect
  // if (req.session) {
  //   req.session.redirectUrl = req.headers.referer || req.originalUrl || req.url;
  // }
  req.flash('error_msg', 'Please log in to view this resource');
  return res.redirect('/users/login');
}

function ensureNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    req.flash('success_msg', 'Already logged In, Please logout first to login again');
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = { ensureAuthenticated, ensureNotAuthenticated };
