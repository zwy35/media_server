/// <reference types="node" />
import * as net from "net";
import { EventEmitter } from "events";
declare enum ReadStates {
    SEARCHING = 0,
    READING_RTSP_HEADER = 1,
    READING_RTSP_PAYLOAD = 2,
    READING_RAW_PACKET_SIZE = 3,
    READING_RAW_PACKET = 4
}
declare type Connection = 'udp' | 'tcp';
declare type Headers = {
    [key: string]: string | number | undefined;
    Session?: string;
    Location?: string;
    CSeq?: number;
    "WWW-Authenticate"?: string;
    Transport?: string;
    Unsupported?: string;
};
export default class RTSPClient extends EventEmitter {
    username: string;
    password: string;
    headers: {
        [key: string]: string;
    };
    isConnected: boolean;
    _url?: string;
    _client?: net.Socket;
    _cSeq: number;
    _unsupportedExtensions?: string[];
    _session?: string;
    _keepAliveID?: any;
    _nextFreeInterleavedChannel: number;
    _nextFreeUDPPort: number;
    readState: ReadStates;
    messageBytes: number[];
    rtspContentLength: number;
    rtspStatusLine: string;
    rtspHeaders: Headers;
    rtspPacketLength: number;
    rtspPacket: Buffer;
    rtspPacketPointer: number;
    clientSSRC: number;
    constructor(username: string, password: string, headers: {
        [key: string]: string;
    });
    _netConnect(hostname: string, port: number): Promise<unknown>;
    connect(url: string, { keepAlive, connection }?: {
        keepAlive: boolean;
        connection: Connection;
    }): Promise<any>;
    request(requestName: string, headersParam?: Headers, url?: string): Promise<{
        headers: Headers;
        mediaHeaders?: string[];
    } | void>;
    respond(status: string, headersParam?: Headers): void;
    play(): Promise<this>;
    pause(): Promise<this>;
    close(isImmediate?: boolean): Promise<this>;
    _onData(data: Buffer): void;
    _sendInterleavedData(channel: number, buffer: Buffer): void;
    _sendUDPData(host: string, port: number, buffer: Buffer): void;
    _emptyReceiverReport(): Buffer;
}
export { RTPPacket, RTCPPacket } from "./util";
