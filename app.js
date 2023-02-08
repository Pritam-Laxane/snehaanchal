const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const http = require('http');
const https = require('https');
const path = require('path');
const useragent = require('express-useragent');
const morgan = require('morgan');
const logger = require('./helpers/winston');

require('dotenv').config();

//configure the session storage to mysql db
const mysql2 = require('mysql2/promise');
const MySQLStore = require('express-mysql-session')(session);
const dbConfig = require('./config/mysql-config');
const sessionDBOptions = {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    user: dbConfig.USER,
    password: dbConfig.PWD,
    database: 'snehaa_sessions',
};
const connection = mysql2.createPool(sessionDBOptions);
const sessionStore = new MySQLStore({}, connection);

// Bring in passport config
require('./helpers/init-passport')(passport);

// secure server options
const httpOptions = {
    // pfx: fs.readFileSync(path.join(__dirname, 'keys', 'snehaanchal.pfx')),
    // passphrase: '123456',
};

const app = express();

// middlewares
app.use(morgan('combined', { stream: logger.stream })); // log requests to winston
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression({ level: 6 }));
app.use(cors());
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main_layout');
app.use(express.static(path.join(__dirname, 'public')));
app.use(useragent.express());

// body parsers
app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ limit: '60mb', extended: false }));

// configure the session, passport and flash
const hour = 60 * 60 * 1000; //(60min * (60sec *1000milisecond)
const halfHour = hour / 2;
app.set('trust proxy', 1); // trust first proxy
app.use(
    session({
        store: sessionStore,
        name: 'sessionID',
        secret: 'Gvv8V}CGBk5-r;RK}}z))e{#S:%aG1U+%t8;b0epoT57|;9k4bVy]mG8cm=}SnehaAnchal',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: halfHour },
    })
);
// // secure cookies in production env.
// if (process.env.NODE_ENV !== 'production') {
//   session.cookie.secure = true; // serve secure cookies
// }

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global Variables using custom middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.userData = req.user;
    res.locals.userAgent = req.useragent;
    next();
});

// session test middleware -
app.get('/sessionData', function (req, res, next) {
    if (req.session.views) {
        req.session.views++;
        res.setHeader('Content-Type', 'text/html');
        res.write('<p>views: ' + req.session.views + '</p>');
        res.write(
            '<p>expires in: ' + req.session.cookie.maxAge / 1000 + 's</p>'
        );
        res.write(
            '<p>Original MaxAge: ' + req.session.cookie.originalMaxAge + '</p>'
        );
        res.write('---------------');
        res.write(JSON.stringify(req.useragent));
        res.write(req.remoteAddress);
        res.end();
        // console.log(req.useragent);
    } else {
        req.session.views = 1;
        res.end('welcome to the session view, refresh for session data!');
    }
});

//Define routes and custom middleware
app.use('/', require('./routes/homeRoute.js'));
app.use('/users', require('./routes/usersRoute.js'));
app.use('/patient', require('./routes/patientRoute.js'));
app.use('/religion', require('./routes/religionRoute.js'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Sorry!, The page you are looking for is not found.');
    err.status = 404;
    next(err);
});

// error handler, this has to be last middleware
app.use(function (err, req, res, next) {
    res.status(err.status || 500); //set default error code, if not already there..
    if (err.status === 404) {
        return res.render('errPages/show404', { path: req.url });
    } else {
        // email to development team
        logger.error(err);
        // const emailer = require('./helpers/emailError');
        // emailer.sendEmail2JAK(err.message);
        return res.render('errPages/showGenericErr', { err: err.message });
    }
});

// Set PORT and START server
const httpPort = process.env.PORT || 8000;
if (process.env.NODE_ENV === 'production') {
    // non-production env...start non-secure server
    http.createServer(app).listen(httpPort, () => {
        logger.info(`Server started at http://localhost:${httpPort}`);
    });
    //Production env...start secure server
    // https.createServer(httpOptions, app).listen(httpPort, () => {
    //   console.log(`Secure server started at https://localhost:${httpPort}`);
    // });
} else {
    // non-production env...start non-secure server
    http.createServer(app).listen(httpPort, () => {
        logger.info(`Server started at http://localhost:${httpPort}`);
    });
}
