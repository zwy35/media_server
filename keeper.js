
const path = require('path');
const {spawn,fork} = require('child_process');
let para = process.argv.slice(2);
let host = para[0];
//连接websocket server的端口
let ports = [1101,1102]

for (let i = 0; i < ports.length; i++) {
    let cmd = path.join(__dirname, "receiver.js");
    const keeper = fork(`${cmd}`, [host,ports[i]],
        {
            env: process.env
        }
    );
}
