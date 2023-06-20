const express = require('express')
const app = express()
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
const connectDB = require('./mongodb')
const bodyParser = require('body-parser')
const User = require('./models/users')

app.use(bodyParser.json());
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
})

const Message = require('./models/messages')

connectDB()

const rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    // Join a room
    socket.on('join', (room) => {
        socket.join(room);
        if (!rooms[room]) {
            rooms[room] = [];
        }
        rooms[room].push(socket.id);
        console.log(`User joined room ${room}`);
    });

    // Leave a room
    socket.on('leave', (room) => {
        socket.leave(room);
        if (rooms[room]) {
            const index = rooms[room].indexOf(socket.id);
            if (index !== -1) {
                rooms[room].splice(index, 1);
                console.log(`User left room ${room}`);
            }
            if (rooms[room].length === 0) {
                delete rooms[room];
            }
        }
    });

    // Handle chat messages
    socket.on('chatMessage', async (room, message) => {
        await Message.find({ grp: room })
            .then(async doc => {
                if (doc.length == 0) {
                    const newGroup = new Message({ grp: room, content: [message] })
                    console.log(newGroup)
                    await newGroup.save()
                }
                else {
                    const u = await Message.findOne({ grp: room });
                    await u.content.push(message);
                    console.log(u)
                    await u.save()
                }
            })
            .catch(err => {
                console.log(err)
            })
        io.to(room).emit('chatMessage', message);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        // Leave all rooms when disconnected
        Object.keys(rooms).forEach((room) => {
            const index = rooms[room].indexOf(socket.id);
            if (index !== -1) {
                rooms[room].splice(index, 1);
                console.log(`User left room ${room}`);
            }
            if (rooms[room].length === 0) {
                delete rooms[room];
            }
        });
    });
})


//register
app.post('/register', async (req, res) => {
    const { data } = await req.body;
    const user = await {
        username: data.username,
        email: data.email,
        password: data.password,
    }
    await console.log('Received data:', data);
    User.insertMany([user])
    // Process the data as needed

    res.json({ message: 'Data received successfully!' });
});

//login
app.post("/login", async (req, res) => {
    const { data } = await req.body;
    const user = await User.find({ username: data.username })
    console.log(data, user[0])
    if (user) {
        if (data.password === user[0].password) {
            res.send({ message: "login sucess", user: user })
        } else {
            res.send({ message: "wrong credentials" })
        }
    } else {
        res.send("not registered")
    }
});

server.listen(3001, () => {
    console.log("server on 3001");
})