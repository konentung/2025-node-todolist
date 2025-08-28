function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect('/auth/login');
  }
}

function requireGuest(req, res, next) {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    next();
  }
}

module.exports = { requireAuth, requireGuest };
