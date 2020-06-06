const chatForm = document.getElementById('chat-form');
const socket = io();
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

//Join Chat room
socket.emit('joinRoom', { username, room });

//get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit listener
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  //getr msg text by ID
  const msg = e.target.elements.msg.value;

  //emit msg to server
  socket.emit('chatMessage', msg);

  //clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

//output msg to dom
function outputMessage(msg) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p>
  <p class="text">
    ${msg.text}
  </p>`;

  document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

//add users to dom
function outputUsers(users) {
  userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
  console.log(users.map(user => user.username))
}