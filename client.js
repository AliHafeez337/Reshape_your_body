const ws=new WebSocket('ws://localhost:3232')
ws.onmessage=((payload)=>
  {
  console.log(payload.data)
  })
  document.forms[0].onsubmit=()=>
{
  const message=document.getElementById('message').value;
   ws.send(message)
}