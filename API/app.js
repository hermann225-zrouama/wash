require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');

// router imports
const customerRouter = require('./routes/customer.route');
const pressingRouter = require('./routes/pressing.route');
const washClothesRequestRouter = require('./routes/washClothesRequest.route');
const authRouter = require('./routes/auth.route');

// create express app
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use(session({
    secret: 'secret$%^134',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent customer side JS from reading the cookie 
        maxAge: 1000 * 60 * 10 // session max age in miliseconds
    }
}));

app.use('/customer', customerRouter);
app.use('/pressing', pressingRouter);
app.use('/request', washClothesRequestRouter);
app.use('/auth', authRouter);


module.exports = app;