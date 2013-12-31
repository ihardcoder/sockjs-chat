var content = $('#content');
var status_txt = $('#status');
var input_area = $('#input');
var send_bt = $('#send_bt');
var connect_bt = $('#connect_bt');

var sockjs_url = '/echo';
var sockjs;

var myName = "";

var firstconnect = true;

//输入框“回车”提交
input_area.keydown(function(e) {
    if (e.keyCode === 13) {
      sendMsg();
    }
});

//提交按钮
send_bt.click(sendMsg);

// 进入聊天室
connect_bt.click(connect);


function connect(){
  sockjs = new SockJS(sockjs_url);


  sockjs.onopen  = function()  {

    if(firstconnect){
        status_txt.text('已连接!请输入昵称');
        firstconnect = false;
    }else{
        status_txt.text('已连接！');
    }
        
  };
  sockjs.onmessage = function(e) {
    if(e.data === "0"){
        status_txt.text('昵称已被注册，请重新输入');
        return;
    }else{
      status_txt.text('已连接！');
      var p = document.createElement('p');
      p.innerHTML = e.data;
      content.prepend(p);
    }
  };
  sockjs.onclose   = function()  {

    var p = document.createElement('p');
    p.innerHTML = getTime() + "-服务器断开连接";
    content.prepend(p); 
  };

}

function sendMsg(){
    var msg = input_area.val();
    if (!msg){
        return
    };

    sockjs.send(msg);  //发送信息

    input_area.val('');   //清空输入框

    //如果是第一次连接，则设置昵称
    if (firstconnect) {
        myName = msg;
    }
}

var getTime=function(){
  var date = new Date();
  return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}
