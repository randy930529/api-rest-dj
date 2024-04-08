import { WebSocket } from "ws";

export default class WebSocketServer {
  wss: WebSocket;

  constructor() {
    this.wss = new WebSocket.Server({ noServer: true });
    this.start();
  }

  private start() {
    this.wss.on("connection", (ws) => {
      console.log("WebSocket client connected");

      ws.on("close", () => {
        console.log("WebSocket client disconnected");
      });
    });
  }

  async handleUpgrade(request, socket, head) {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit("connection", ws, request);
    });
  }

  async handlePublishUpgrade(payload: { type: string; data: string }) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
      }
    });
  }
}
