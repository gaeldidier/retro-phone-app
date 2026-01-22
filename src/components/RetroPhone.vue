<template>
  <div class="phone-container">
    <div class="display">{{ dialedNumber }}</div>

    <div class="buttons">
      <button v-for="n in numbers" :key="n" @click="pressNumber(n)">{{ n }}</button>
      <button @click="deleteNumber">DEL</button>
    </div>

    <div class="controls">
      <button @click="pickUp" :disabled="connected">Pick Up</button>
      <button @click="call" :disabled="!pickedUp || connected">Call</button>
      <button @click="hangUp" :disabled="!connected && !pickedUp">Hang Up</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Howl } from 'howler'

const numbers = ['1','2','3','4','5','6','7','8','9','0']
const dialedNumber = ref('')
const pickedUp = ref(false)
const connected = ref(false)

let localStream = null
let peerConnection = null

// Sounds
const pickupSound = new Howl({ src: ['/assets/sounds/pickup.mp3'] })
const dialSound = new Howl({ src: ['/assets/sounds/dial.mp3'] })
const hangupSound = new Howl({ src: ['/assets/sounds/hangup.mp3'] })
const deleteSound = new Howl({ src: ['/assets/sounds/delete.mp3'] }) // optional

// Handle number press
function pressNumber(n) {
  dialedNumber.value += n
  dialSound.play()
}

// Delete last digit
function deleteNumber() {
  if (dialedNumber.value.length > 0) {
    dialedNumber.value = dialedNumber.value.slice(0, -1)
    deleteSound.play()
  }
}

// Pick up handset
async function pickUp() {
  pickedUp.value = true
  pickupSound.play()

  // Get microphone
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
}

// Hang up
function hangUp() {
  hangupSound.play()
  dialedNumber.value = ''
  pickedUp.value = false
  connected.value = false

  if (peerConnection) {
    peerConnection.close()
    peerConnection = null
  }
}

// Start call
async function call() {
  if (!pickedUp.value) return alert('Pick up first!')

  connected.value = true
  alert('Connecting to your friend on LAN...')

  // Create simple peer connection
  peerConnection = new RTCPeerConnection()

  // Add local audio
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream))

  // Remote audio element
  const audioEl = document.createElement('audio')
  audioEl.autoplay = true
  peerConnection.ontrack = (event) => {
    audioEl.srcObject = event.streams[0]
  }
  document.body.appendChild(audioEl)

  // **IMPORTANT**: For real LAN calls, signaling is needed
  alert('This is a prototype: actual LAN connection requires signaling')
}
</script>

<style scoped>
.phone-container {
  width: 400px;
  margin: 50px auto;
  border: 3px solid #333;
  border-radius: 15px;
  padding: 20px;
  background: #222;
  color: #0f0;
  text-align: center;
  font-family: monospace;
}

.display {
  width: 90%;
  margin: 0 auto 20px auto;
  height: 50px;
  border: 2px inset #0f0;
  font-size: 24px;
  line-height: 50px;
  background: #000;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.buttons button, .controls button {
  padding: 15px;
  font-size: 18px;
  background: #555;
  color: #0f0;
  border: 2px solid #0f0;
  border-radius: 8px;
  cursor: pointer;
}

.buttons button:hover, .controls button:hover {
  background: #0f0;
  color: #000;
}

.controls {
  display: flex;
  justify-content: space-around;
}
</style>
