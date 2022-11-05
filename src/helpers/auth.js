const helpers = {};

//ingresa al inicio de facturacion
helpers.isAuthenticated = (req, res, next) => {
  
  if (req.isAuthenticated()) {
    
      return next();
  }
  req.flash("error", "Sesión finalizada.");
  res.redirect("/iniciar-sesion");
};

module.exports = helpers;
