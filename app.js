const app = require('express')(),
    server = require('http').Server(app),
    { Server } = require("socket.io"),
    io = new Server(server),
    usernames = [];

server.listen(process.env.PORT || 3000);

app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('new user', function(data, callback) {
        if(usernames.indexOf(data) !== -1) {
            callback(false);
        } else {
            callback(true);
            socket.username = data;
            usernames.push(socket.username);
            updateUsernames();
        }
    });

    //Update usernames
    function updateUsernames() {
        io.sockets.emit('usernames', usernames);
    }

    //send message
    socket.on('send message', (data) => {
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });

    socket.on('disconnect', function(data) {
        if(!socket.username) {
            return;
        }
        usernames.splice(usernames.indexOf(socket.username), 1);
        updateUsernames();
    })
});

module.exports = app;
