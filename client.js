// const WebSocket = require('ws');
const ws=new WebSocket('ws://localhost:3232')
//to recieve message from server

ws.onmessage=((payload)=>
  {
  console.log(payload.data)
  })
  document.forms[0].onsubmit=()=>
{
  const message=document.getElementById('message').value;
   ws.send(message)
}