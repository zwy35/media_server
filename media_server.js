// Yellowstone Example.
//
// Connects to the specified RTSP server url,
// Once connected, opens a file and streams H264 and AAC to the files
//
// Yellowstone is written in TypeScript. This example uses Javascript and
// the typescript compiled files in the ./dist folder

const { RTSPClient2, RecordRawData} = require("./dist");
const fs = require("fs");
const childProcess = require('child_process');
const path = require('path');
// User-specified details here.
//const url = "rtsp://172.17.134.17:8554/stream";
//const filename = "bigbuckbunny";
//const username = "";
//const password = "";

const url = "rtsp://admin:admin1234@172.18.192.141/live1.sdp";
const filename = "bigbuckbunny_camera";
const username = "admin";
const password = "admin1234";


var myArgs = process.argv.slice(2);

const express = require('express');
const SocketServer = require('ws').Server;
let PORT = undefined;
let udpPort = undefined;

if(myArgs.length > 0) {
    if(myArgs.length >= 1)
        udpPort = myArgs[0];    //RTP port:  5000
    if(myArgs.length >= 2)
        PORT = myArgs[1];       //websocket port: 11
}

if(udpPort === undefined) {
    console.log('Please input the parameters.\n e.g.\n node media_server.js <rtp port> <webSocket Port> or \n node media_server.js <rtp port>');
    return;
}
var clientProcess;
function initClientProcess(PORT) {
    console.log("Init stats child process");
    clientProcess = childProcess.fork(path.join(__dirname, './clientProcess.js'));
    clientProcess.on('error', function (err) {
        console.error("Client child process closed: " + err);
        clientProcess = null;
    });
    clientProcess.on('close', function (code) {
        console.error("Client child process closed: " + code);
        clientProcess = null;
    });
    clientProcess.send({type: "init", port: PORT});
}

// const server = express().listen(PORT, () => console.log(`Listening on ${PORT}`));
// const ws = new SocketServer({ server });
// let g_wsObjs = [];
// let g_wsObjPkgs = [];

// if(PORT !== undefined){
//     ws.on('connection', wsObj => {
//         console.log('Client connected')
//         g_wsObjs.push(wsObj);
//         g_wsObjPkgs.push(0);
//         console.log('ws connection counts : ', g_wsObjs.length);
//
//
//         wsObj.on('close', () => {
//             console.log('Close connected');
//             g_wsObjs.pop();
//             g_wsObjPkgs.pop();
//             console.log('ws connection counts : ', g_wsObjs.length);
//         })
//     })
// }

// Step 1: Create an RTSPClient instance
const client = new RTSPClient2(username, password, udpPort);

// Step 2: Connect to a specified URL using the client instance.
//
// "keepAlive" option is set to true by default
// "connection" option is set to "udp" by default.
client.connect(url, { connection: "udp" })
.then((detailsArray) => {
    console.log("Connected");

    for (let x = 0; x < detailsArray.length; x++) {
        let details = detailsArray[x];
        console.log(details);
        console.log(`Stream ${x}. Codec is`, details.codec);
    }

    //const rawFile = fs.createWriteStream('rawdata.data');
    //const raw = new RecordRawData(client, rawFile, null);

    // Step 5: Start streaming!
    client.play();
})
.catch(e => console.log(e));

// Step 3: create process for browser.
initClientProcess(PORT);

// The "data" event is fired for every RTP packet.
client.on("data", (channel, data, packet) => {
    console.log("RTP:", "Channel=" + channel, "TYPE=" + packet.payloadType, "ID=" + packet.id, "TS=" + packet.timestamp, "M=" + packet.marker);
    if(!clientProcess) {
        initClientProcess(PORT);
    }
    clientProcess.send({type: "data", data: {channel: channel, data: data, packet: packet}});
    // if(g_wsObjs.length > 0){
    //     for(let nIndex = 0 ; nIndex < g_wsObjs.length; ++nIndex){
    //         if(g_wsObjs[nIndex] !== undefined){
    //             let pkgInfoObj = {
    //                 "channel" : channel,
    //                 "type" : packet.payloadType,
    //                 "id" : packet.id,
    //                 "ts" : packet.timestamp,
    //                 "m" : packet.marker
    //             };
    //             let pkgInfoString = JSON.stringify(pkgInfoObj);
    //
    //             g_wsObjs[nIndex].send(pkgInfoString);
    //             //console.log('count :' , g_wsObjPkgs[nIndex]++);
    //
    //             g_wsObjs[nIndex].send(data, { binary: true });
    //             console.log('count :' , g_wsObjPkgs[nIndex]+=2);
    //             //console.log(data);
    //             //g_wsObjs[nIndex].send('hi');
    //         }
    //     }
    // }
});

// The "controlData" event is fired for every RTCP packet.
client.on("controlData", (channel, rtcpPacket) => {
    console.log("RTCP:", "Channel=" + channel, "TS=" + rtcpPacket.timestamp, "PT=" + rtcpPacket.packetType);
});

// The "log" event allows you to optionally log any output from the library.
// You can hook this into your own logging system super easily.

client.on("log", (data, prefix) => {
    console.log(prefix + ": " + data);
});
