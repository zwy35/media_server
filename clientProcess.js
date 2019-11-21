const fs = require("fs");
const https = require('https');
const WebSocket = require('ws');
const server = https.createServer({
  cert: fs.readFileSync('/userdata/config/cwmserver-cert.pem'),
  key: fs.readFileSync('/userdata/config/cwmserver-key.pem')
});

let dataQueue = [];
let g_wsObjs = [];
let g_wsObjPkgs = [];
process.on('message', (config) => {
    console.log(config);
    var PORT = parseInt(config.port);
    if(config.type == 'init') {

        console.log('Client process started');
        //const server = express().listen(PORT, () => console.log(`Listening on ${PORT}`));
        const ws = new WebSocket.Server({ server });
        server.listen(PORT)

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
        enqueReceive(config.data);
        /*
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
        */
    }
});

function send2Broswer() {
    if(!isReceiveQueueEmpty()){
        let datas = dequeueReceive();
        if(datas && g_wsObjs.length > 0){
            for(let nIndex = 0 ; nIndex < g_wsObjs.length; ++nIndex){
                if(g_wsObjs[nIndex] !== undefined){
                    for(let i = 0; i < datas.length; i++){
                        let pkgInfoObj = {
                            "channel" : datas[i].channel,
                            "type" : datas[i].packet.payloadType,
                            "id" : datas[i].packet.id,
                            "ts" : datas[i].packet.timestamp,
                            "m" : datas[i].packet.marker
                        };
                        let pkgInfoString = JSON.stringify(pkgInfoObj);

                        g_wsObjs[nIndex].send(pkgInfoString);
                        //console.log('count :' , g_wsObjPkgs[nIndex]++);

                        g_wsObjs[nIndex].send(datas[i].data, { binary: true });
                        console.log('count :' , g_wsObjPkgs[nIndex]+=2);
                        //console.log(data);
                        //g_wsObjs[nIndex].send('hi');
                    }
                }
            }
        }
    }
}

function isReceiveQueueEmpty() {
    if (dataQueue.length > 0) {
        return false;
    }
    return true;
}

function dequeueReceive() {
    if (dataQueue.length > 0) {
        if (dataQueue.length < 10) {
            return dataQueue.splice(0, dataQueue.length);
        }
        else {
            return dataQueue.splice(0, 10);
        }
    }else{
        return null;
    }
}

function enqueReceive(data) {
    console.log("RTP:", "Channel=" + data.channel, "TYPE=" + data.packet.payloadType, "ID=" + data.packet.id, "TS=" + data.packet.timestamp, "M=" + data.packet.marker);
    dataQueue.push(data);
}

setInterval(function () {
    //console.log("send data to Broswer");
    send2Broswer();
}, 500);
