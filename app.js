var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
// var sqlite3 = require("sqlite3").verbose();
// var db = new sqlite3.Database(":memory:");

app.set('trust proxy', 1) // trust first proxy

app.use(function (req, res, next) {
    next();
});
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
const PORT = process.env.PORT || 8080;
app.get("/", (request, response) => {
    response.render("index");
});
var _email;
app.post("/registration", function (request, response) {
    const email = request.body.email.toString().toLowerCase();
    const password = request.body.password;

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
        console.log(socket.user);
        io.emit("get_user", socket.user);
    });
    socket.on("new_message", function (message) {
        if (socket.user == message.sender) {
            message.direction = "right";
            console.log("equal");
        } else {
            console.log("not");
            message.direction = "left";
        }
        io.emit("received", message);
    });
    socket.on('draw', function (data) {
        io.emit("do_draw", data);
    });

    socket.on('image', function (image) {
        io.emit("image_data", image);
    });
});


http.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
