import { createHash } from "crypto";
import { spawn } from "child_process";

export interface RTPPacket {
  id: number;
  timestamp: number;
  marker: number;

  payload: Buffer;
  length: number;

  payloadType: number;
}

export function parseRTPPacket(buffer: Buffer): RTPPacket {
  const padding = (buffer[0] >> 5) & 0x01
  const hasExtensions = (buffer[0] >> 4) & 0x01;
  const marker = (buffer[1]) >>> 7;
  const payloadType = buffer[1] & 0x7f;
  const num_csrc_identifiers = (buffer[0] & 0x0F);

  const payload = buffer.slice((num_csrc_identifiers * 4) + (hasExtensions ? 16 : 12));
  const { length } = payload;

  return {
    id: buffer.readUInt16BE(2),
    timestamp: buffer.readUInt32BE(4),
    marker,
    payload,
    length,
    payloadType
  };
}

export interface RTCPPacket {
  timestamp: number;
  packetType: number;

  buffer: Buffer;
}

export function parseRTCPPacket(buffer: Buffer): RTCPPacket {
  const packetType = buffer[1];
  const timestamp = buffer.readUInt32BE(16);

  return {
    timestamp,
    packetType,
    buffer
  };
}

// utility function for using crypto library
export function getMD5Hash(str: string): string {
  const md5 = createHash("md5");
  md5.update(str);

  return md5.digest("hex");
}

interface Transport {
  protocol: string;
  parameters: { [key: string]: string };
}

export function parseTransport(transport: string): Transport {
  const parameters: { [key: string]: string } = {};

  const parts = transport.split(";");
  const protocol = parts[0];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const index = part.indexOf("=");

    if (index > -1 && index !== part.length - 1) {
      parameters[part.substring(0, index)] = part.substring(index + 1);
    }
  }
  
  return {
    protocol,
    parameters
  };
}

export function randInclusive(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSSRC(): number {
  return randInclusive(1, 0xffffffff);
}

// BitStream classse by 2018 Roger Hardiman, RJH Technical Consultancy Ltd
// Write to a bitstream and read back as an array

export class BitStream {

  data: number[] = []; // Array only stores 0 or 1 (one 'bit' per buffer item)
                           // not very efficienet on memory

  // Constructor
  constructor(){
  }

  // Functions
  AddValue(value: number, num_bits: number) {
      // Add each bit to the List
      for (let i = num_bits-1; i >= 0; i--) {
          this.data.push((value>>i) & 0x01);
      }
  }

  AddHexString(hex_string: string) {
      let hex_chars = hex_string.toUpperCase();

      for(let x = 0; x < hex_chars.length; x++) {
          let c = hex_chars.charAt(x);
          if (c=='0') this.AddValue(0,4);
          else if (c=='1') this.AddValue(1, 4);
          else if (c=='2') this.AddValue(2, 4);
          else if (c=='3') this.AddValue(3, 4);
          else if (c=='4') this.AddValue(4, 4);
          else if (c=='5') this.AddValue(5, 4);
          else if (c=='6') this.AddValue(6, 4);
          else if (c=='7') this.AddValue(7, 4);
          else if (c=='8') this.AddValue(8, 4);
          else if (c=='9') this.AddValue(9, 4);
          else if (c=='A') this.AddValue(10, 4);
          else if (c=='B') this.AddValue(11, 4);
          else if (c=='C') this.AddValue(12, 4);
          else if (c=='D') this.AddValue(13, 4);
          else if (c=='E') this.AddValue(14, 4);
          else if (c=='F') this.AddValue(15, 4);
      }
  }

  Read(num_bits: number) {
      // Read and remove items from the front of the list of bits
      if (this.data.length < num_bits) return 0;
      let result = 0;
      for (let i = 0; i < num_bits; i++) {
          result = result << 1;
          result = result + this.data[0];
          this.data.shift(); // remove the first item from the array
      }
      return result;
  }

  ToArray() {
      let num_bytes = Math.ceil(this.data.length/8.0);
      let array = new Buffer(num_bytes);
      let ptr = 0;
      let shift = 7;
      for (let i = 0; i < this.data.length; i++) {
          array[ptr] += (this.data[i] << shift);
          if (shift == 0) {
              shift = 7;
              ptr++;
          }
          else {
              shift--;
          }
      }

      return array;
  }
}
