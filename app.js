console.log('app.js is running');
console.log('感谢使用！个人官网 suuyw.icu')
const http = require('http');
const fs = require('fs');
//引用模块
var context = {};//声明记忆标识变量
// 666 我真绷不住了，我把={}删了代就跑不起来了，666，虽然这是我的问题
var config = require('.\\config.json')
//var whitelist;
//var jsonParsed_read;
/* fs.readFileSync('./whitelist.json', (err, data) => {
    if (err) {
        console.log(err)
    }
    //console.log(data.toString())
    jsonParsed_read = JSON.parse(data);//解析json
    console.log(jsonParsed_read)
    // options_ai = jsonParsed_read.options_ai;
    // options_message = jsonParsed_read.options_message;
    // options_userinfo = jsonParsed_read.options_userinfo;
    whitelist = jsonParsed_read.whitelist;
    //console.log(options_ai,options_message,options_userinfo,whitelist)
}) */
var whitelist = config.whitelist;
const options_ai = config.options_ai;
const options_message = config.options_message;
const options_userinfo = config.options_userinfo;
const server_port = config.port;
const banwords = config.banwords;
/* const options_ai = {
    hostname: 'localhost',
    port: 11434,
    path: '/api/generate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};
//声明ai设置变量
const options_message = {
    hostname: '192.168.50.99',
    port: 10010,
    path: '/text',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};
//声明昵称获取设置变量
const options_userinfo = {
    hostname: '192.168.50.99',
    port: 10010,
    path: '/userinfo',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
}; */
var selfname
userinfo()
//声明消息设置变量
function ai_and_send(message, aters, roomid, isgroup) {
    //原谅我，这个异步我实在玩不懂，只能这样瞎写了
    if (whitelist.includes(roomid) || whitelist.includes(aters)) {
        if (message.includes('\@' + selfname + '\u2005') || isgroup === false || message.includes(banwords) === flase) {
            message = message.replace('\@' + selfname + '\u2005', '')
            const req_ai = http.request(options_ai, res => {
                let data_ai = ''; //声明data_ai
                res.on('data', chunk_ai => {
                    data_ai += chunk_ai.toString();
                });
                res.on('end', () => {
                    //console.log(data_ai); //打印数据
                    let jsonParsed_ai = JSON.parse(data_ai); //解析json
                    let response = jsonParsed_ai.response; //读取返回内容
                    let context_j = jsonParsed_ai.context;
                    let created_at = jsonParsed_ai.created_at
                    //console.log(context_j);//ai返回的记忆标识
                    //console.log(response);
                    context[`r${roomid}`] = context_j;//存入变量
                    //console.log(context[`r${roomid}`])
                    //eval(`context.r${roomid} = ${context_j}`);
                    console.log(created_at + ' ' + aters + '\(' + roomid + '\)\: ' + message)
                    send(response, aters, roomid)//请求发送函数
                    return (response);
                });
            });
            req_ai.write(JSON.stringify({ "model": "llama3.1:8b", "prompt": message, "stream": false, "context": context[`r${roomid}`] }));
            //req_ai.write(JSON.stringify({ "model": "llama3.1:8b", "prompt": message, "stream": false }));
            req_ai.end(); //ai请求内容
        }
    }
};
function send(message, aters, roomid) {
    const req_message = http.request(options_message, res_message => {//请求微信
        let data_message = '';
        res_message.on('data', chunk_message => {//接受数据
            data_message += chunk_message.toString();
        });
        res_message.on('end', () => {//结束
            //console.log(data_message);//打印数据
            //jsonParsed_message = JSON.parse(data_message);//声明变量
            //response = jsonParsed_message.response;
            ////console.log(response);
            return (data_message);
        });
    });
    req_message.write(JSON.stringify({//请求微信内容
        "aters": aters,
        "msg": message,
        "receiver": roomid,
    }));
    req_message.end();
};
function userinfo() {
    const req_userinfo = http.request(options_userinfo, res_userinfo => {//请求微信
        let data_userinfo = '';
        res_userinfo.on('data', chunk_userinfo => {//接受数据
            data_userinfo += chunk_userinfo.toString();
        });
        res_userinfo.on('end', () => {//结束
            //console.log(data_userinfo);//打印数据
            //console.log(options_userinfo);
            //jsonParsed_message = JSON.parse(data_message);//声明变量
            //response = jsonParsed_message.response;
            ////console.log(response);
            let jsonParsed_userinfo = JSON.parse(data_userinfo);//解析json
            let name = jsonParsed_userinfo.data.name;//读取返回内容
            //console.log(name);
            selfname = name;
            return (name);
        });
    });
    req_userinfo.end();
};
//{ "model":"llama3.1:8b","prompt":"我上一句说了什么qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq","stream":false}
//设置消息回调路径
const server = http.createServer((request, response) => {
    //console.log(request.url);
    if (request.url === "/message") {
        //console.log("ok");
        let body = ''
        request.on('data', chunk => {
            //console.log(chunk.toString())
            body = body + chunk;
        });
        request.on('end', () => {
            //var jsondata = body.toString();
            //console.log(body);
            response.end('{ \"statuscode\":200}');
            //var jsonParsed = JSON.parse(jsondata);
            let jsonParsed_message = JSON.parse(body);//解析json
            let is_group = jsonParsed_message.is_group;
            let type = jsonParsed_message.type;
            let roomid = jsonParsed_message.roomid;
            var now = new Date();
            //console.log(is_group);
            //console.log(type);
            //if (jsonParsed.type === 3) { };
            if (type === 1) {//如果消息类型是文本
                let sender = jsonParsed_message.sender;
                content = jsonParsed_message.content;
                console.log("["+ now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds() + "]",roomid,content);
                //console.log(sender);
                //console.log(content);
                ai_and_send(content, sender, roomid, is_group);
            };
        })

    } else {
        response.end('{ \"statuscode\":404}');
    };
});
//获取内容,返回
server.listen(server_port, () => {
    console.log('http server is running',server_port);
});
//监听端口11927
