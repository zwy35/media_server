const ws = require('ws');
const fs = require('fs');

let para = process.argv.slice(2);
console.log(para)

if (para.length !== 2) {
  console.log('Please input the right parameters.\n e.g.\n node client.js <destination ip address> <destination port>');
  return;
}

var host = 'wss://' + para[0] + ':' + para[1] + '/';

console.log(host);

let client = new ws(host, {
  protocolVersion: 8,
  origin: 'https://' + para[0] + ':' + para[1],
  rejectUnauthorized: false
});
//let client = new ws('ws://localhost:11/');

client.onopen = () => {
  console.log('open connection');
}

let filename = para[1] + '.264'

let count = 0;
client.onmessage = event => {
  console.log(typeof event.data);
  if (typeof event.data != 'string') {
    console.log('receive data');
    fs.writeFile(filename, event.data, function(err) {
      fs.readFile(filename, function(err, contents) {
        //console.log(contents.toString());
      });
    });
  }else{
    console.log(event.data);
  }

  console.log('count :', count++);
}

client.onclose = () => {
  console.log('close connection')
}
