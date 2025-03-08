import * as core from "express-serve-static-core";
import * as http from "http";
import * as ws from "ws";


// Mapa para almacenar las conexiones WebSocket por ID de cliente
export const socketClients: Map<string, ws> = new Map();

export default function WebSocketServer(app: core.Express){
    const server = http.createServer(/*app*/);
    const wss = new ws.Server({ noServer: true });

    server.on("upgrade", (request, socket, head) => {
      wss.handleUpgrade(request, socket as any, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });
    
    wss.on("connection", (ws, request: http.IncomingMessage) => {
      const clientId = request.url?.split("/socket/")[1];
      if (clientId) {
        socketClients.set(clientId, ws);
      }
    
      ws.on("close", () => {
        if (clientId) {
          socketClients.delete(clientId);
        }
      });
    });

    return {server, wss}
}
