<script setup>
import { ref } from "vue"
import { io } from "socket.io-client"

const socket = io("http://localhost:3000")

const username = ref("")
const joined = ref(false)
const users = ref({})
const calling = ref("")
const incoming = ref("")

function join() {
  if (!username.value) return
  socket.emit("join", username.value)
  joined.value = true
}

function callUser(id) {
  calling.value = users.value[id]
  socket.emit("call", id)
}

socket.on("users", data => {
  users.value = data
})

socket.on("incoming-call", data => {
  incoming.value = data.fromName
})
</script>

<template>
  <div style="font-family: monospace; padding: 20px">
    <h2>📻 Retro Phone</h2>

    <div v-if="!joined">
      <input v-model="username" placeholder="Your name" />
      <button @click="join">Join</button>
    </div>

    <div v-else>
      <h3>🟢 Online Users</h3>

      <ul>
        <li v-for="(name, id) in users" :key="id">
          <span v-if="name !== username">
            {{ name }}
            <button @click="callUser(id)">Call</button>
          </span>
          <span v-else>👉 You ({{ name }})</span>
        </li>
      </ul>

      <p v-if="calling">📞 Calling {{ calling }}...</p>
      <p v-if="incoming">📲 Incoming call from {{ incoming }}</p>
    </div>
  </div>
</template>
