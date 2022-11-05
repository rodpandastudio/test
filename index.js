if(process.env.NODE_ENV !==  "production"){
  require('dotenv').config();
}
const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const expressSession = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const flash = require("connect-flash");
const cron = require("node-cron");
const MongoStore = require('connect-mongo');
const helmet = require("helmet");

//Inicializacion
const app = express();
require("./src/database");
require("./src/config/passport");

//Configuraciones

console.log(exphbs)

app.set("port", process.env.PORT || 5050);
app.set("views", path.join(__dirname, "src", "views"));
app.engine(
  ".hbs",
  exphbs.engine({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layout"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

//Middlewears

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(
  expressSession({
    secret: process.env.MYALL,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.DB_HOST
    })
  })
);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      frameAncestors: [
        'https://inmigracioninteligente.rodpandastudio.com',
        'http://localhost:3000',
      ],
      
      scriptSrcElem: [
        'http://localhost:5050',
        'https://cdn.jsdelivr.net/npm/sweetalert2@11',
        'https://code.jquery.com/jquery-3.4.1.min.js',
        'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js',
        'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js'
      ],
      styleSrcElem: [
        'http://localhost:5050',
        'https://fonts.gstatic.com',
        'https://fonts.googleapis.com',
        'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
        'https://cdn.materialdesignicons.com/4.8.95/css/materialdesignicons.min.css',
        'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',

      ],
    }
  },
  frameguard: false,
  xFrameOptions: false,
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true , limit: '50mb'}));
app.use(cors());
app.use(flash());


//Variables globales
app.use((req, res, next)=>{
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  next()
})
app.use((req, res, next)=> {
  res.locals.error = req.flash('error');
  next()
})

app.use((req, res, next)=> {
  res.locals.success = req.flash('success');
  next()
})

//Rutas


app.use(require("./src/routes/administracion"));
app.use(require("./src/routes/api"));

//Archivos estaticos

app.use(express.static(path.join(__dirname,"src", "public")));

//Iniciar server

app.listen(app.get("port"), () => {
  console.log("Escuchando en " + app.get("port"));
});
