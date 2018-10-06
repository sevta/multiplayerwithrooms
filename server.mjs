import express from 'express'
import socket from 'socket.io'
import path from 'path'
import ejs from 'ejs'
import bodyParser from 'body-parser'
import http from 'http'

let app = express()
let server = http.Server(app)
let __dirname = path.resolve()
const port = 3000
let io = socket(server)

app.set('view engine' , 'html')
app.engine('html' , ejs.renderFile)
app.set('views' , path.join(__dirname , 'views'))
app.use(express.static(__dirname + '/public'))

app.get('/' , (req , res) => res.render('index'))

server.listen(port , () => console.log(`Server listen on port ${port}`))

function getClientsInRoom(roomCode , users) {
  if (io.sockets.adapter.rooms[roomCode]) {
    let rooms = io.sockets.adapter.rooms[roomCode].sockets
    let peopleInRoom = []
    let allusers = []
    for (let i in rooms) {
      peopleInRoom = [...Object.keys(rooms)]
    } 
    for (let i in peopleInRoom) {
      allusers.push(users[peopleInRoom[i]])
    }
  
    return allusers
  }
}


let users = {}

io.on('connection' , socket => {
  users[socket.id] = {
    socketId: socket.id ,
    username: null ,
    is_host: false ,
    is_ready: false ,
    player: null ,
    is_join_room: false ,
    room_code: null 
  }
  console.log('users connected' , users)

  socket.emit('send socketid' , {
    socketId: socket.id
  })

  socket.on('is ready' , data => {
    users[data.socketId].is_ready = true 
    console.log('user ready' , users)
    
    let usertemp = getClientsInRoom(users[data.socketId].room_code , users)

    io.in(users[data.socketId].room_code).emit('update state' , {
      text: `${users[data.socketId].username} is ready...` ,
      users: usertemp
    })
  })


  socket.on('create room' , data => {
    console.log(data)
    users[socket.id].username = data.username
    users[socket.id].is_host = true 
    users[socket.id].is_join_room = true 
    users[socket.id].room_code = data.room_code
    users[socket.id].player = 1

    socket.join(data.room_code)
    console.log(users)
    console.log('rooms' , io.sockets.adapter.rooms)
    // let people = getClients(data.room_code)
    // console.log(people)
    let allrooms = io.sockets.adapter.rooms[data.room_code].sockets
    let allpeopleinroom = []
    let usertemp = getClientsInRoom(data.room_code , users)
    
    console.log(usertemp)
 
    io.in(data.room_code).emit('room created' , {
      text: 'room created',
      users: usertemp
    })
  }) 

  socket.on('all allready' , data => {
    console.log(data)
    io.in(data.roomCode).emit('ready to play' , {
      text: 'all allready to play games'
    })
  })

  socket.on('join room' , data => {
    console.log(data)
    let allrooms = io.sockets.adapter.rooms
    console.log('allrooms' , allrooms)
    if (allrooms[data.room_code]) {
      socket.join(data.room_code)
      users[socket.id].username = data.username
      users[socket.id].is_host = false 
      users[socket.id].is_join_room = true 
      users[socket.id].room_code = data.room_code
      users[socket.id].player = 1

      let usertemp = getClientsInRoom(data.room_code , users)
      console.log('users', users)
      console.log('joined' , allrooms)
      console.log('and users is' , usertemp)
      io.in(data.room_code).emit('room created' , {
        text: 'room created',
        users: usertemp
      })
    } else {
      socket.emit('room not found' , {
        text: 'room not found'
      })
    }
  })  

  socket.on('disconnect' , () => {
    console.log(`Users disconnect ${users[socket.id]}`)
    if (users[socket.id].is_join_room) {
      let usertemp = getClientsInRoom(users[socket.id].room_code , users)
      io.in(users[socket.id].room_code).emit('room created' , {
        text: 'room created',
        users: usertemp
      })
      socket.leave(users[socket.id].room_code)
    }
    delete users[socket.id]
    console.log(users)
  })
})

