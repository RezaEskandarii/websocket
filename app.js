var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
// var sqlite3 = require("sqlite3").verbose();
// var db = new sqlite3.Database(":memory:");
var session = require('express-session');
var _session;
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: '123456^$%#$',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
}));
app.use(function (req, res, next) {
    _session = req.session;
    next();
});
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
const PORT = 80;
app.get("/", (request, response) => {
    response.render("index");
});
var _email;
app.post("/registration", function (request, response) {
    const email = request.body.email.toString().toLowerCase();
    const password = request.body.password;
    request.session.email = email;
    _email = email;
    // db.serialize(function () {
    //     db.run("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,email VARCHAR(255),password VARCHAR(255))");
    //     var stmt = db.prepare("insert into users (`email`,`password`) values (?,?)");
    //     stmt.run(email, password);
    //     stmt.finalize();
    // });
    response.redirect("/room");
});

app.get("/room", function (req, res) {
    _session = req.session;
    res.render("room");
});


function fetchUsers() {
    var users = [];
    // db.each("select * from users", async function (error, user) {
    //     if (error) {
    //         console.log(error);
    //     }
    //
    //     await users.push(user);
    // });
    // console.log(users);
    return users;
}


io.on('connection', function (socket) {
    socket.on("new_user", (_user_) => {
        socket.user = _user_;
        io.emit("get_user", socket.user);
    });
    socket.on("new_message", function (message) {
        if (socket.user == message.sender) {
            message.direction = "right";
        } else {
            message.direction = "left";
        }
        io.emit("received", message);
    });
    socket.on('draw',function (data) {
       io.emit("do_draw",data);
    });
});


http.listen(PORT);