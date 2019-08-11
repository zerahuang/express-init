// 引用dao
var personDao = require("../dao/person");
// 获得网络数据
var http = require("http");
var url = require("url");
// 下载图片到本地
var request = require("request");
// 写文件
var fs = require("fs");

exports.init = function (req, res, next) {
    // name
    var name = req.query.name;
    // 拉取数据
    getUrl("http://www.e3ol.com/biography/inc_ajax.asp?types=index&a1=&a2=&a3=&a4=&a7=&a6=&a5=&key=%E6%9B%B9%E6%93%8D&pageno=1&callback=jQuery111302932088182173016_1564814329221&_=1564814329224", function (err, data) {
        console.log(data);
    });
    // console.log("xxxxxx");
    // .replace(/<[^>]*>|<\/[^>]*>/gm, "");  // 去掉所有标签
    // personDao.queryList(function (err, data) {
    //     // res.jsonp({
    //     //     ret : 0,
    //     //     msg: "",
    //     //     data: data,
    //     //     name: name
    //     // });
    // });
    // console.log(process.cwd())
    request("http://www.e3ol.com/biography/pic/id/240/59.jpg").pipe(fs.createWriteStream(process.cwd() + "/public/images/sanpk/59.jpg"));
}

/**
 * 获得网络数据
 * @Author   huangshoalu
 * @DateTime 2019-08-03
 * @param    {String}    url      地址
 * @param    {Function}  callback 回调函数
 */
function getUrl(link, callback) {
    var urlobj = url.parse(link);
    http.get({
        host: urlobj.host,
        path: urlobj.path,
        method: "get",
        headers: {
        }
    }, function(resdata){
        var _str = "";
        resdata.on('data', function(data) {
            _str = _str + data;
        });
        resdata.on("end",function(){
            //这里要改很多东西
            callback("", eval("(" + _str.replace(/[^(]+\(/,"").replace(/\)$/,"")+ ")"));
            // console.log(_str);
        });
    }).on('error', function(e) {
        callback("http error");
        // console.log(e);
    });
}