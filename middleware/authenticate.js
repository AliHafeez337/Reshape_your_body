var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');

    // console.log('token here');
    // console.log(token);
    User.findByToken(token).then((user)=> {
        // console.log('user is here');
        // console.log(user);
        if (!user){
            return Promise.reject("No user found.");
        }
        else if (user.verification != ""){
            return Promise.reject("Non-varified user.");
        }
        
        req.person = user;
        req.token = token;
        next();
    }).catch((e)=>{
        // console.log(e)
        res.status(401).send({
            "errmsg": "Token missing, Unauthorized."
        });
    })
}

var adminauthenticate = (req, res, next) => {
    var token = req.header('x-auth');
    // var token = req.query['x-auth'];

    User.findByToken(token).then((user)=> {
        // console.log(user);
        if (!user){
            return Promise.reject("No user found.");
        }
        else if (user.verification != ""){
            return Promise.reject("Non-varified user.");
        }
        else if(user.usertype != "admin"){
            return Promise.reject("Sorry, you are not an admin.");
        }

        req.person = user;
        req.token = token;
        next();
    }).catch((e)=>{
        // console.log(e)
        res.status(401).send({
            "errmsg": "Token missing, Unauthorized."
        });
    })
}

var partnerauthenticate = (req, res, next) => {
    var token = req.header('x-auth');
    // var token = req.query['x-auth'];

    User.findByToken(token).then((user)=> {
        // console.log(user);
        if (!user){
            return Promise.reject("No user found.");
        }
        else if (user.verification != ""){
            return Promise.reject("Non-varified user.");
        }
        else if(user.usertype != "partner"){
            return Promise.reject("Sorry, you are not the partner.");
        }

        req.person = user;
        req.token = token;
        next();
    }).catch((e)=>{
        // console.log(e)
        res.status(401).send({
            "errmsg": "Token missing, Unauthorized."
        });
    })
}

var customerauthenticate = (req, res, next) => {
    var token = req.header('x-auth');
    // var token = req.query['x-auth'];

    User.findByToken(token).then((user)=> {
        // console.log(user);
        if (!user){
            return Promise.reject("No user found.");
        }
        else if (user.verification != ""){
            return Promise.reject("Non-varified user.");
        }
        else if(user.usertype != "customer"){
            return Promise.reject("Sorry, you are not a customer.");
        }

        req.person = user;
        req.token = token;
        next();
    }).catch((e)=>{
        // console.log(e)
        res.status(401).send({
            "errmsg": "Token missing, Unauthorized."
        });
    })
}

var userauthenticate = (req, res, next) => {
    var token = req.header('x-auth');
    // var token = req.query['x-auth'];
    // console.log(req.header)

    User.findByToken(token).then((user)=> {
        // console.log(user);
        if (!user){
            return Promise.reject("No user found.");
        }
        else if (user.verification != ""){
            return Promise.reject("Non-varified user.");
        }
        else if(user.usertype != "user"){
            return Promise.reject("Sorry, you are not the user.");
        }
        
        req.person = user;
        req.token = token;
        next();
    }).catch((e)=>{
        // console.log(e)
        res.status(401).send({
            "errmsg": "Token missing, Unauthorized."
        });
    })
}

var adminpartnerauthenticate = (req, res, next) => {
    var token = req.header('x-auth');
    // var token = req.query['x-auth'];
    // console.log(req.header)

    User.findByToken(token).then((user)=> {
        // console.log(user);
        if (!user){
            return Promise.reject("No user found.");
        }
        else if (user.verification != ""){
            return Promise.reject("Non-varified user.");
        }
        else if(user.usertype == "admin" || user.usertype == "partner"){
            req.person = user;
            req.token = token;
            next();
        }
        else{
            return Promise.reject("Sorry, you are not the partner or an admin.");
        }
        
    }).catch((e)=>{
        // console.log(e)
        res.status(401).send({
            "errmsg": "Token missing, Unauthorized."
        });
    })
}
var usercustomerauthenticate = (req, res, next) => {
    var token = req.header('x-auth');
    // var token = req.query['x-auth'];

    User.findByToken(token).then((user)=> {
        // console.log(user);
        if (!user){
            return Promise.reject("No user found.");
        }
        else if (user.verification != ""){
            return Promise.reject("Non-varified user.");
        }
        else if(user.usertype == "customer" || user.usertype == "user"){
            req.person = user;
            req.token = token;
            next();
        }
        
        else{
            return Promise.reject("Sorry, you are not a customer.");
        }

    }).catch((e)=>{
        // console.log(e)
        res.status(401).send({
            "errmsg": "Token missing, Unauthorized."
        });
    })
}

module.exports = {
    authenticate,
    adminauthenticate, 
    partnerauthenticate,
    customerauthenticate,
    userauthenticate,
    adminpartnerauthenticate,
    usercustomerauthenticate
};