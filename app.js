import WebSocket, { WebSocketServer } from 'ws';
import { exec } from "child_process";
import { promises } from "fs";
const fsp = promises;

const wss = new WebSocket.Server({ port: 8080 });

console.log("WebSocket created.");

wss.on("connection",(ws)=>{
    // code
})