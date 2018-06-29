var PORT = 8080, absoluteUrl = 'F:\\Code\\SmartTool';//

var http = require('http');
var url=require('url');
var fs=require('fs');
var mine=require('mime')._types;//
var path=require('path');
mine.log = 'multipart/form-data';
var mappingConfig = JSON.parse(fs.readFileSync('./mappings/config.json'));
console.log(JSON.stringify(mappingConfig));
var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var realPath = path.join(absoluteUrl, pathname);    //这里设置自己的文件名称;

    var ext = path.extname(realPath);
    ext = ext ? ext.slice(1) : 'unknown';
    //如果不是静态文件，则当做请求处理，与配置文件匹配
    
    if(!mine[ext]){
        var reqObj;
        for(var i=0;i<mappingConfig.length;i++){
            reqObj = mappingConfig[i];
            console.log(request.url);
            if(request.url.indexOf(reqObj.request.url) >-1){
                console.log('---' + reqObj.response.path)
                realPath = path.join('',reqObj.response.path);
                break;
            }
        }
    }
    
    fs.exists(realPath, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });

            response.write("This request URL " + pathname + " was not found on this server.");
            response.end();
        } else {
            fs.readFile(realPath, "binary", function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    response.end(err);
                } else {
                    var contentType = mine[ext] || "text/plain";
                    response.writeHead(200, {
                        'Content-Type': contentType
                    });
                    response.write(file, "binary");
                    response.end();
                }
            });
        }
    });
});
server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");