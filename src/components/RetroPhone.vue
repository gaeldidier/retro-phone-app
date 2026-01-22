<template>
  <div class="phone">
    <div class="screen">{{ dialed }}</div>

    <div class="keys">
      <button v-for="n in numbers" :key="n" @click="press(n)">
        {{ n }}
      </button>
      <button class="del" @click="del">DEL</button>
    </div>

    <div class="actions">
      <button @click="pickup" :disabled="picked">Pick Up</button>
      <button @click="call" :disabled="!picked || connected">Call</button>
      <button @click="hangup" :disabled="!picked">Hang Up</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"

const numbers = ["1","2","3","4","5","6","7","8","9","0"]

const dialed = ref("")
const picked = ref(false)
const connected = ref(false)

let localStream = null
let pc = null
let socket = null

// 🔴 CHANGE THIS TO YOUR SERVER COMPUTER IP
const SIGNALING_SERVER = "ws://192.168.1.5:3000"

function press(n) {
  dialed.value += n
}

function del() {
  dialed.value = dialed.value.slice(0, -1)
}

async function pickup() {
  picked.value = true
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
}

function hangup() {
  if (pc) pc.close()
  if (socket) socket.close()

  pc = null
  socket = null
  dialed.value = ""
  picked.value = false
  connected.value = false
}

async function call() {
  pc = new RTCPeerConnection()
  connected.value = true

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream)
  })

  const audio = document.createElement("audio")
  audio.autoplay = true

  pc.ontrack = e => {
    audio.srcObject = e.streams[0]
  }

  pc.onicecandidate = e => {
    if (e.candidate) {
      socket.send(JSON.stringify({ type: "ice", candidate: e.candidate }))
    }
  }

  socket = new WebSocket(SIGNALING_SERVER)

  socket.onmessage = async (msg) => {
    const data = JSON.parse(msg.data)

    if (data.type === "offer") {
      await pc.setRemoteDescription(data.offer)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.send(JSON.stringify({ type: "answer", answer }))
    }

    if (data.type === "answer") {
      await pc.setRemoteDescription(data.answer)
    }

    if (data.type === "ice") {
      await pc.addIceCandidate(data.candidate)
    }
  }

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: "offer", offer }))
  }
}
</script>

<style scoped>
.phone {
  width: 360px;
  margin: 40px auto;
  padding: 20px;
  background: #222;
  color: #0f0;
  border-radius: 20px;
  font-family: monospace;
}

.screen {
  height: 50px;
  background: black;
  border: 2px solid #0f0;
  margin-bottom: 20px;
  font-size: 24px;
  text-align: center;
  line-height: 50px;
}

.keys {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.keys button,
.actions button {
  padding: 14px;
  font-size: 18px;
  background: #444;
  color: #0f0;
  border: 2px solid #0f0;
  border-radius: 8px;
  cursor: pointer;
}

.del {
  grid-column: span 3;
  background: darkred;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
</style>
