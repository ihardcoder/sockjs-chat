var express = require('express'),
    sockjs = require('sockjs'),
    http = require('http'),
    path = require('path'); 

var EXIST_NICKNAME = '0';

var app = express(); 

// Express 配置
app.configure(function(){
  app.set('port',  1388);
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});


var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};

var sockjs_echo = sockjs.createServer(sockjs_opts);

var clients = {}; //用于保存所有连接用户

sockjs_echo.on('connection', function(conn) {
	console.log("connected");

	// 构造客户端对象
    var client = {
    	connection : conn,
        nickname : ""
    };

    // 监听data事件
    conn.on('data', function(message) {

     var res = "";

        if(client.nickname === ""){
        	if(!clients[message]){
        	  client.nickname = message;
              res = getTime() + "-" + client.nickname + "加入聊天室";
              console.log(client.nickname + ' login');
            }else{  //用户名重复
              res = EXIST_NICKNAME;
              conn.write(res);
              return;
            }
        }else{
        	res = getTime() + "-" + client.nickname + "说：" + message;
            console.log(client.nickname + ' say: ' + message);
        }

        clients[client.nickname] = client;

        writeMsg(clients,res);
    });

    //监听close事件
    conn.on('close', function() {
    	
    	var res = "";
    	res = getTime() + "-" + client.nickname + "退出聊天室";
    	console.log(res);

    	delete clients[client.nickname]; //删除退出的用户信息

        writeMsg(clients,res);
    });
});

// 大厅广播信息
function writeMsg(clients,res){
	if(!clients){
		return;
	}
	for(var c in clients){
		if(clients.hasOwnProperty(c) && clients[c].connection){
			clients[c].connection.write(res);
		}
	}
};


var server = http.createServer(app);

sockjs_echo.installHandlers(server, {prefix:'/echo'});

server.listen(app.get('port'), function(){
  console.log("Server is listening on port " + app.get('port'));
});

app.get('/', function (req, res) {
    res.sendfile('views/index.html');
});

var getTime=function(){
  var date = new Date();
  return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}