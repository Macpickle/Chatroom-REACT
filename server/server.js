require('dotenv').config(); // for envconst IN_PRODUCTION = process.env.NODE_ENV === 'production';

const express = require('express');
const app = express();
const externalRouter = require('./routes/routes');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const flash = require('express-flash');
const passport = require('passport');
const initpassport = require('./utils/passport-config');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');

//socket server
const http = require('http');
const Server = require('socket.io').Server;
const server = http.createServer(app);
const io = new Server(server,
    {
        cors: {
            origin: 'http://localhost:3001',
            methods: ['GET', 'POST'],
            credentials: true,
        }
    }
);



//models
const User = require('./models/Users');

app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


const IN_PRODUCTION = process.env.NODE_ENV === 'production';

//connects mongoose to the mongoDB database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//creates a new session store to store sessions from users
const store = new MongoDBStore({
    mongooseConnection: process.env.DATABASE_URL,
    databaseName: 'chatApp',
    collection: 'sessions',
});

// stores session data
app.use(session({
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET_KEY,
    store: store,
    cookie: {
        maxAge: parseInt(process.env.SESSION_LIFE),
        sameSite: true,
        secure: IN_PRODUCTION,
        },
    }
));

app.use(flash());

//initialize passport
app.use(express.urlencoded({extended: false}));
app.use(express.json());

initpassport(
    passport,
    async username => await User.findOne({ username: username }),
    async id => await User.findOne({ _id: id })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(externalRouter);
app.use(errorHandler);

//socket server
io.on('connection', (socket) => {
    socket.on('message', (data) => {
        io.emit('message', data);
    });

    socket.on('delete', (data) => {
        io.emit('delete', data);
    })
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
