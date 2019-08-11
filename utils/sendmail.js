var nodemailer = require("nodemailer");

/**
 * 发邮件
 * @author huangshaolu
 * @date   2016-07-27
 * @param  {String}   toerp   被发送人的邮箱地址
 * @param  {String}   content 内容
 */
exports.sendMail = function(emailaddress,title,content,callback){
	//发送邮件
	// function sendNow(emailaddress){
	//替换邮件内容
	// content = content.replace(/\{name\}/g,username);
	var transport = nodemailer.createTransport({
	    host: "smtp.jd.local",
	    port: 25, // port for secure SMTP
	    auth: {
	        user: "wxsq-ptcxactive",
	        pass: "Market&*2106"
	    }
	});
	
	transport.sendMail({
	    from : "CPS管理系统 <wxsq-ptcxactive@jd.com>",
	    to : emailaddress,
	    subject: title,
	    generateTextFromHTML : true,
	    html : content
	}, function(error, response){
	    if(error){
            console.log("邮件推送失败");
	    }else{
            console.log("邮件推送成功");
	    }
	    transport.close();
	    callback && callback();
	});
	// }
}