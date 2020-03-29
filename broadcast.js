const WebScoketServer= require('ws').Server;
var ObjectId = require('mongoose').Types.ObjectId;
const {MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const {url} = require('./config');
const {Broadcasts}= require ('./models/broadcast')
const WSS=new WebScoketServer({port:3232})
//Listening to the client for any event/message
WSS.on('connection',(ws)=>
{     
    console.log('We are connected')
    ws.on('message',(message)=>
    {
      //Sending each connected  clients a broadcast
        WSS.clients.forEach((client)=>
    {
    client.send(message)
    MongoClient.connect(url,  (err, db) => {
    if (err) {
              return "error connecting db"
             } 
        var dbo = db.db("ReshapeYourBody");
        // var myobj = { name: "me", address: "song " };
        const broadcast1=new Broadcasts({ adminID:mongoose.Schema.Types ,body:message,createdAt:Date.now()})
          dbo.collection("broadcast").insertOne(broadcast1, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted"+message);
            db.close();
          });
        })
      }) 
   })
    
    // console.log(ws)
  
})

module.exports={WSS}

// var {WSS }= require('./broadcast/websocket-server');

// var {client} = require('./broadcast/client');
