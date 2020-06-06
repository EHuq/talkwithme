const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utilities/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utilities/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'Sir Theodore Bumbleberry the Third'
//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//run when client connects
io.on('connection', socket => {

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //send user room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });

    socket.emit('message', formatMessage(botName, 'Enjoy talking!'));

    //when a user connects broadcast
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat!`));


  });

  //listen for emission of chat msg
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  //when user disconnects
  socket.on('disconnect', () => {

    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left :(`));

      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }

  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));