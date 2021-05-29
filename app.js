const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const cp = require('child_process')
const fs = require('fs')

const app = express()
const server = http.createServer(app)
const io = new socketIO.Server(server)

async function compile(text) {
    const file = '/tmp/.web-ide-temp-code.py'
    fs.writeFileSync(file, text)
    const buf = cp.execSync(`python3 "${file}"`)
    fs.rmSync(file)
    return buf.toString()
}

app.use(express.static(__dirname + '/static'))

io.on('connection', socket => {
    console.log('user connected')

    socket.on('input', text => {
        compile(text)
            .then(result => socket.emit('output', result))
            .catch(err => socket.emit('output-error', err.toString()))
    })

    socket.on('disconnect', () => {
        console.log('use disconnected')
    })
})

server.listen(3000, () => {
    console.log('listening on *:3000')
})