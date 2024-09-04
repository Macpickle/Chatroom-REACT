require('dotenv').config(); // for envconst IN_PRODUCTION = process.env.NODE_ENV === 'production';

// server imports
const express = require('express');
const app = express();
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const passport = require('passport');
const initpassport = require('./utils/passport-config');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');

//models
const User = require('./models/Users');

//routes
const externalRouter = require('./routes/routes');
const userManagement = require('./routes/userManagement')

// for cors configuration
const origin = process.env.NODE_ENV === "development" 
    ? "http://localhost:3001"
    : "https://chatapp.com";

//socket server allows for live updates to elements (messages, replies, etc...)
const http = require('http');
const Server = require('socket.io').Server;
const server = http.createServer(app);
const io = new Server(server,
    {
        cors: {
            origin: origin,
            methods: ['GET', 'POST'],
            credentials: true,
            'Access-Control-Allow-Credentials': true,
        }
    }
);

// cors for client usage
app.use(cors({
    origin: origin,
    credentials: true,
}));

// allows for session to be held in production if need
const IN_PRODUCTION = process.env.NODE_ENV === 'production';

// connects mongoose to the mongoDB database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// creates a new session store to store sessions from users
const store = new MongoDBStore({
    mongooseConnection: process.env.DATABASE_URL,
    databaseName: 'chatApp',
    collection: 'sessions',
});

// stores session data
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET_KEY,
    store: store,
    cookie: {
        maxAge: 60 * 60 * 24 * 1000,
        sameSite: true,
        secure: IN_PRODUCTION,
        domain: 'localhost',
        },
    }
));

app.use(express.json());

//initialize passport
initpassport(
    passport,
    async username => await User.findOne({ username: username }),
    async id => await User.findOne({ _id: id })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended: false}));

app.use(externalRouter);
app.use(userManagement);
app.use(errorHandler);

//socket server
io.on('connection', (socket) => {
    console.log("USER CONNECT: " + socket.id);

    socket.on('join', (data) => {
        socket.join(data);
    })

    socket.on('message', (data, parent) => {
        console.log(parent);
        io.to(parent).emit('message', data);
    });

    socket.on('delete', (data) => {
        io.emit('delete', data);
    })
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
