var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');

    User.findByToken(token).then((user)=> {
        console.log(user);
        if (!user){
            return Promise.reject();
        }
        
        req.user = user;
        req.token = token;
        next();
    }).catch((e)=>{
        // console.log(e)
        res.status(401).send(e);
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
        else if(user.usertype != "admin"){
            return Promise.reject("Sorry, you are not an admin.");
        }

        req.user = user;
        req.token = token;
        next();
    }).catch((e)=>{
        // console.log(e)
        res.status(401).send(e);
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
        else if(user.usertype != "partner"){
            return Promise.reject("Sorry, you are not the partner.");
        }

        req.user = user;
        req.token = token;
        next();
    }).catch((e)=>{
        // console.log(e)
        res.status(401).send(e);
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
        else if(user.usertype != "customer"){
            return Promise.reject("Sorry, you are not a customer.");
        }

        req.user = user;
        req.token = token;
        next();
    }).catch((e)=>{
        // console.log(e)
        res.status(401).send(e);
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
        else if(user.usertype != "user"){
            return Promise.reject("Sorry, you are not the user.");
        }
        
        req.user = user;
        req.token = token;
        next();
    }).catch((e)=>{
        // console.log(e)
        res.status(401).send(e);
    })
}

module.exports = {
    authenticate,
    adminauthenticate, 
    partnerauthenticate,
    customerauthenticate,
    userauthenticate};