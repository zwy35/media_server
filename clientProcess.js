//const express = require('express');
const SocketServer = require('ws').Server;

let g_wsObjs = [];
let g_wsObjPkgs = [];
process.on('message', (config) => {
    //console.log(config);
    var PORT = parseInt(config.port);
    if(config.type == 'init') {

        console.log('Client process started');
        //const server = express().listen(PORT, () => console.log(`Listening on ${PORT}`));
        const ws = new SocketServer({port: PORT});
        if(PORT !== undefined){
            ws.on('connection', wsObj => {
                console.log('Client connected');
                g_wsObjs.push(wsObj);
                g_wsObjPkgs.push(0);
                console.log('ws connection counts : ', g_wsObjs.length);

                wsObj.on('close', () => {
                    console.log('Close connected');
                    g_wsObjs.pop();
                    g_wsObjPkgs.pop();
                    console.log('ws connection counts : ', g_wsObjs.length);
                })
            })
        }
    }
    if(config.type == 'data') {
        let channel = config.data.channel;
        let packet = config.data.packet;
        let data = config.data.data;
        console.log("RTP:", "Channel=" + channel, "TYPE=" + packet.payloadType, "ID=" + packet.id, "TS=" + packet.timestamp, "M=" + packet.marker);
        if(g_wsObjs.length > 0){
            for(let nIndex = 0 ; nIndex < g_wsObjs.length; ++nIndex){
                if(g_wsObjs[nIndex] !== undefined){
                    let pkgInfoObj = {
                        "channel" : channel,
                        "type" : packet.payloadType,
                        "id" : packet.id,
                        "ts" : packet.timestamp,
                        "m" : packet.marker
                    };
                    let pkgInfoString = JSON.stringify(pkgInfoObj);

                    g_wsObjs[nIndex].send(pkgInfoString);
                    //console.log('count :' , g_wsObjPkgs[nIndex]++);

                    g_wsObjs[nIndex].send(data, { binary: true });
                    console.log('count :' , g_wsObjPkgs[nIndex]+=2);
                    //console.log(data);
                    //g_wsObjs[nIndex].send('hi');
                }
            }
        }
    }

});
