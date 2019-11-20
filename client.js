//console.log(myArgs);
var myArgs = process.argv.slice(2);
if(myArgs.length !== 2) {
  console.log('Please input the parameters.\n e.g.\n node client.js <destination ip address> <destination port>');
  return;
}

var host = 'ws://' + myArgs[0] + ':' + myArgs[1] + '/';

console.log(host);
var ws = require('ws');
let client = new ws(host);
//let client = new ws('ws://localhost:11/');

client.onopen = () => {
    console.log('open connection');
}

let count = 0;
client.onmessage = event => {
    //console.log(event.data)
    console.log('count :' , count++);
}

client.onclose = () => {
    console.log('close connection')
}