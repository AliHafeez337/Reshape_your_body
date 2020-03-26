const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const session=require('express-session');
const passport=require('passport');
const logger = require('morgan');
const socketIO = require('socket.io');
const http = require('http');

const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('broadcastThisMessage', (message) => {
        console.log('Message to be broadcasted: ', message);

        socket.broadcast.emit('newMessage', message);
    });
});

app.use((req, res, next) => {
    // console.log(req);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-auth"
    );
    res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    next();
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
  // Express session midleware
app.use(session({
    secret: 'ourDirtyLittleSecret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('Hello Moto...!');
});

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});