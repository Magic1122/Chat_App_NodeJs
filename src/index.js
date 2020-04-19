const path = require('path')
const http = require('http')  // different express setup for Socket.IO
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')     // we import generateMessage function to use it to generate messageOBJ
const { addUser, removeUser, getUser, getUsersInRoom, getRooms } = require('./utils/users')

const app = express()
const server = http.createServer(app) // different express setup for Socket.IO

const io = socketio(server) // This is why we have to create the server like this to pass it as an arguement to socket.io


const port = process.env.PORT || 3000

const publicPath = path.join(__dirname, '..', 'public')
console.log(publicPath)

app.use(express.static(publicPath))

app.get('/', (req, res) => {
    res.send(publicPath, 'index.html')
})

app.get('/rooms', async (req, res) => {
    const rooms = await getRooms()
    res.send(rooms)
})


io.on('connection', (socket) => { // we have access to socket as the first arguement
    console.log('New WebSocket connection.')
    /* socket.emit('message', generateMessage('Welcome'))

    socket.broadcast.emit('message', generateMessage('A new user has joined!')) */  // it leaves out the actual client

    socket.on('join', ({ username, room }, callback) => {     // we set up a listener to join, destructure the object immediately
        const { error, user } = addUser({ id: socket.id, username, room })      // we use our helper functions to store the user, and also destructuring the return value to have conditional logic for error handling

        if (error) {
            return callback(error)        // we have to set up error parameter on client side as well in chat.js, return stops the function running
        }

        socket.join(user.room)     // socket.join allows us to join to a room

        socket.emit('message', generateMessage('Admin', `Welcome ${user.username}!`)) 

        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))

        io.to(user.room).emit('roomData', {        // by each join emitting the data to the client to let the client render the room name and the users inside the room
            room: user.room, 
            users: getUsersInRoom(user.room)
        })

        callback()      // we let the client know that the join was successfull

        // socket.emit (to the client), io.emit (to everyone), socket.boradcast.emit (to everyone, except the client)
        // io.to(roomname).emit (to everyone in a room), socket.broadcast.to(roomname).emit (to everyone in the room except the client) 
    })

    socket.on('sendMessage', (msg, callback) => {  // final callback for acknowledgement
        const user = getUser(socket.id)


        const filter = new Filter()  // bad-words library to filter inappropriate words

        if (filter.isProfane(msg)) {        // checks if the word inappropriate is
            return callback('Profanity is not allowed!')
        }
        
        io.to(user.room).emit('message', generateMessage(user.username, msg))  // io.emit emits an event for all connections
        callback()  // acknowledgement
    })

    socket.on('sendLocation', ({ longitude, latitude }, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))      // generate the location OBJ with our function
        callback()
    })

    socket.on('disconnect', () => {

        const user = removeUser(socket.id)      // removing our user by disconnect

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {     // after someone left the room emiting the data to the client to let them update the users in the room
                room: user.room, 
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => console.log(`Server is running on port ${port}.`)) // different express setup for Socket.IO
