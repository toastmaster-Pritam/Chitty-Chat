const socket = io();

const textAudio = new Audio("/audio/sendsound.wav");
const popup = new Audio("/audio/notification.mp3");

const hambergerBtn = document.querySelector(".hamberger-btn");
const userWindow = document.querySelector(".user-window");
const chat = document.querySelector(".chat");
const userList = document.querySelector(".user-list");
const userCount = document.querySelector("#user-count");
const sendBtn = document.querySelector(".send-btn");
const inputText = document.querySelector("#inputText");

hambergerBtn.addEventListener("click", () => {
  if (userWindow.style.display == "block") {
    userWindow.style.display = "none";
  } else {
    userWindow.style.display = "block";
  }
});
let username;
do {
  username = prompt("Enter Your Name:");
} while (!username);

socket.emit("new-user-joined", username); //emit function emits an event named new-user-joined to server

socket.on("user-connected", (socket_name) => {
  userJoinLeft(socket_name, "joined");
});
socket.on("user-disconnected", (socket_name) => {
  userJoinLeft(socket_name, "left");
});

socket.on("user-list", (users) => {
  userList.innerHTML = "";
  var userArray = Object.values(users);
  for (let i = 0; i < userArray.length; i++) {
    const people = document.createElement("p");
    people.innerHTML = userArray[i];
    userList.appendChild(people);
  }
  userCount.innerHTML = userArray.length;
});

const userJoinLeft = (name, status) => {
  const div = document.createElement("div");
  div.classList.add("user-join");
  let content = `<p><strong>${name}</strong> ${status} the chat</p>`;
  div.innerHTML = content;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
};

//sending message
document.addEventListener("keydown", (e) => {
  const pressedkey = e.key;
  if (pressedkey == "Enter") {
    textAudio.play();
    let data = {
      username: username,
      msg: inputText.value,
    };
    if (inputText != "") {
      appendMsg(data, "outgoing");
      socket.emit("message", data);
      inputText.value = "";
    }
  }
});
sendBtn.addEventListener("click", () => {
  textAudio.play();
  let data = {
    username: username,
    msg: inputText.value,
  };
  if (inputText != "") {
    appendMsg(data, "outgoing");
    socket.emit("message", data);
    inputText.value = "";
  }
});

const appendMsg = (data, status) => {
  let div = document.createElement("div");
  div.classList.add("message", status);
  let content = `
       <h5>${data.username}</h5>
       <p>${data.msg}</p>
    `;
  div.innerHTML = content;
  chat.appendChild(div);
  if (status == "incoming") {
    popup.play();
  }
  chat.scrollTop = chat.scrollHeight;
};

socket.on("message", (data) => {
  appendMsg(data, "incoming");
});
