var express = require('express'),
    path = require('path'),
    consolidate = require('consolidate');

var bodyParser = require('body-parser');

const fileUpload = require('express-fileupload');

var isDev = process.env.NODE_ENV !== 'production';
var app = express();
var port = 3000;

app.engine('html', consolidate.ejs);
app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, './server/views'));

app.use(bodyParser.json());

var mongoose = require('mongoose')
var User = require('./models/user')
var Room = require('./models/room')

mongoose.connect('mongodb://localhost/live');

app.use('/static', express.static('client/resources/images'))
app.use('/roombg', express.static('public/roombg'))
app.use('/avatar', express.static('public/avatar'))

app.use(fileUpload());

// 图片上传
app.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  const type = req.body.avatar || req.body.roombg
  // The name of the input field (i.e. "roombg") is used to retrieve the uploaded file
  let pic = req.files[Object.keys(req.files)[0]];
  const name = `${Object.keys(req.files)[0]}_${pic.name}`
  // Use the mv() method to place the file somewhere on your server
  const path = `public/${type}/${name}`
  pic.mv(path, function(err) {
    if (err)
      return res.status(500).send(err);
    Room.getById(req.body.serverId, function(err, room) {
        if (err) {
            console.log(err)
        } else {
            const updateRoom = Object.assign(room, {
                [`${type}url`]: `${type}/${name}`
            })
            updateRoom.save((err, room) => {
                if (err) {
                    res.send({
                        status: 0,
                        err: err
                    })
                    return
                }
                console.log(`update room with serverId: ${req.body.serverId}`)
            })
        }
    })
    const redirectUrl = ``
    res.redirect(`/anchor?${req.body.serverId}`);
  });
});



// local variables for all views
app.locals.env = process.env.NODE_ENV || 'dev';
app.locals.reload = true;

if (isDev) {

    // static assets served by webpack-dev-middleware & webpack-hot-middleware for development
    var webpack = require('webpack'),
        webpackDevMiddleware = require('webpack-dev-middleware'),
        webpackHotMiddleware = require('webpack-hot-middleware'),
        webpackDevConfig = require('./webpack.config.js');

    var compiler = webpack(webpackDevConfig);

    // attach to the compiler & the server
    app.use(webpackDevMiddleware(compiler, {

        // public path should be the same with webpack config
        publicPath: webpackDevConfig.output.publicPath,
        noInfo: true,
        stats: {
            colors: true
        }
    }));
    app.use(webpackHotMiddleware(compiler));

    require('./server/routes')(app);

    // add "reload" to express, see: https://www.npmjs.com/package/reload
    var reload = require('reload');
    var http = require('http');

    var server = http.createServer(app);
    reload(server, app);

    server.listen(port, function(){
        console.log('App (dev) is now running on port 3000!');
    });

} else {

    // static assets served by express.static() for production
    app.use(express.static(path.join(__dirname, 'public')));
    require('./server/routes')(app);
    app.listen(port, function () {
        console.log('App (production) is now running on port 3000!');
    });
}

app.post('/user/add', function(req, res) {
    const nickname = req.body.nickname
    User.getByNickName(nickname, function(err, user) {
        if (err) {
            console.log(err)
        } else {
            if (user) {
                res.send({
                    status: 0,
                    user: user
                })
            } else {
                const newUser = new User({
                    nickname,
                    password: req.body.password
                })
                newUser.save(function(err, user) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.send({
                            status: 0,
                            data: 'ok'
                        })
                    }
                })
            }
        }
    })
})

app.get('/user/:nickname', function(req, res) {
    const nickname = req.params.nickname
    User.getByNickName(nickname, function(err, user) {
        if (err) {
            console.log(err)
        } else {
            res.send({
                status: 0,
                data: user
            })
        }
    })
})

app.get('/rooms', function(req, res) {
    Room.getRooms(function(err, rooms) {
        if (err) {
            console.log(err)
        } else {
            res.send({
                status: 0,
                data: Array.from(rooms)
            })
        }
    })
})

// 删除相关房间
app.delete('/room', function(req, res) {
    const id = req.query.id
    Room.remove({id: id}, function(err, room) {
        if (err) {
            console.log(err)
        } else {
            res.send({
                status: 0,
                data: 'ok'
            })
        }
    })
})

// 新增和更新房间信息
app.post('/room/add', function(req, res) {
    const serverId = req.body.serverId
    Room.getById(serverId, function(err, room) {
        if (err) {
            console.log(err)
        } else  {
            if (room) {
                const updateRoom = Object.assign(room, req.body)
                updateRoom.save((err, room) => {
                    if (err) {
                        res.send({
                            status: 0,
                            err: err
                        })
                    } else {
                        res.send({
                            status: 0,
                            data: 'update success!'
                        })
                    }
                })
            } else {
                const newRoom = new Room(req.body)
                newRoom.save((err, room) => {
                    if (err) {
                        res.send({
                            status: 0,
                            err: err
                        })
                    } else {
                        res.send({
                            status: 0,
                            data: 'ok'
                        })
                    }
                })
            }
        }
    })
})

app.get('/room/:serverId', function(req, res) {
    const serverId = req.params.serverId
    Room.getById(serverId, function(err, room) {
        if (err) {
            console.log(err)
        } else {
            res.send({
                status: 0,
                data: room
            })
        }
    })
})


