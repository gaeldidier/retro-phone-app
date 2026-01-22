const WebSocket = require("ws")

const wss = new WebSocket.Server({ port: 3000 })
let clients = []

console.log("📡 Signaling server running on ws://0.0.0.0:3000")

wss.on("connection", (ws) => {
  clients.push(ws)

  ws.on("message", (msg) => {
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg)
      }
    })
  })

  ws.on("close", () => {
    clients = clients.filter(c => c !== ws)
  })
})
