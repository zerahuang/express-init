var pool = require("../utils/dbpool").getPool();
var async = require("async");

// 数据表
var tablename = "person";
// 主键
var primarykey = "id";
// 排序值
var sortkey = "";

/**
 * 根据factid查询工厂信息
 * @Author   huangshoalu
 * @DateTime 2019-04-26
 * @param    {Function}  callback 回调函数
 */
exports.queryById = function (callback, id) {
    pool.query("select * from " + tablename + " where " + primarykey + " = ?", [id], function (err, data) {
        callback(err, data);
    });
}

/**
 * 新增工厂信息
 * @Author   huangshoalu
 * @DateTime 2019-04-26
 * @param    {Function}  callback 回调函数
 * @param    {Object}    infos    新增信息
 */
exports.add = function (callback, infos, options) {
    // options = {key: xx}
    // 如果infos里面有主键，就直接判断成有了
    if (infos[primarykey]) {
        if (!options) {
            options = {};
        }
        options.key = primarykey;
    }
    // 如果存在的话，就要判断一下，之前是否存在了
    if (options && options.key && infos[options.key]) {
        // 根据key去查询，如果存在就更新，而不是新增
        pool.query("select * from " + tablename + " where " + options.key + " = ?", [infos[options.key]], function (err, data) {
            if(err || (data && data.length != 1)){
                doAdd();
            } else {
                exports.update(function (err1, data1) {
                    callback(err1, data1);
                }, infos, data[0][primarykey]);
            }
        });
    } else {
        doAdd();
    }

    function doAdd () {
        pool.query("insert into " + tablename + " set ?", infos, function(err, data) {
            callback(err, data);
        });
    }
}

/**
 * 更新工厂信息
 * @Author   huangshoalu
 * @DateTime 2019-04-26
 * @param    {Function}  callback 回调函数
 * @param    {Object}    infos    内容
 * @param    {String}    factid   工厂ID
 */
exports.update = function (callback, infos, apply_id) {
    /* apply_id
        {
            status: [{    // 在申请中的
                type: ">=",
                value: "5"
            }, {
                type: "!=",
                value: "6"
            }],
            factory_id: {    // 有对应factid的
                type: "=",
                value: obj.factid
            }
        }
     */

    var sql    = "update " + tablename + " set ";
    var _param = [];
    //将数据加入sql中去
    for (var i in infos) {
        sql += i + " = ? , ";
        _param.push(infos[i]);
    }
    // 去掉多余的逗号
    sql = sql.replace(/, $/, "");

    //设置where条件
    if (typeof apply_id != "object") {
        sql += " where " + primarykey + " = ?";
        _param.push(apply_id);
    } else {
        var where = "";
        // 按条件搜索
        for (var i in apply_id) {
            if (apply_id[i] instanceof Array) {
                apply_id[i].forEach(function (ceil) {
                    where += " " + i + " " + ceil.type + " ? and ";
                    _param.push(ceil.type == "like" ? ("%" + ceil.value + "%") : ceil.value);
                });
            } else {
                where += " " + i + " " + apply_id[i].type + " ? and ";
                _param.push(apply_id[i].type == "like" ? ("%" + apply_id[i].value + "%") : apply_id[i].value);
            }
        }
        where && (where = ' where' + where.substring(0, where.length - 4));
        sql += where;
    }

    // 做一下判断，如果没有where，直接返回异常
    if (sql.indexOf("where") == -1) {
        callback("no where");
        return false;
    }  
    var _t = pool.query(sql, _param, function (err, result) {
        callback(err, result);
    });
}

/**
 * 根据条件查询
 * @Author   huangshoalu
 * @DateTime 2019-04-26
 * @param    {Function}  callback  回调函数
 * @param    {Number}    pagenum   页码
 * @param    {Number}    pagesize  每页长度
 * @param    {Object}    searchobj 搜索条件
 */
exports.queryList = function (callback, searchobj, option) {
    // searchobj = {
    //      begin_time: {
    //          type: "<=",//= like
    //          value: "xxx"
    //      }
    // }
    if (!option) {
        option = {};
    }
    if ((option.pagenum && option.pagenum == "0") || !option.pagenum) {
        option.pagenum = 1;
    }
    option.pagesize = option.pagesize || 10;
    var pagingParam = [(option.pagenum - 1) * option.pagesize, option.pagesize * 1.0];
    var paramArr = [];
    var where = "";
    // 按条件搜索
    for (var i in searchobj) {
        where += " " + i + " " + searchobj[i].type + " ? and ";
        paramArr.push(searchobj[i].type == "like" ? ("%" + searchobj[i].value + "%") : searchobj[i].value);
    }
    where && (where = ' where' + where.substring(0, where.length - 4));
    var sql = "select * from " + tablename + " " + where + (sortkey ? " order by " + sortkey + " DESC" : "")

    // 查询列表和查询总数
    function _getList(callback) {
        pool.query(sql + " limit ?, ?", paramArr.concat(pagingParam), function (err, data) {
            callback && callback(err, data);
        })
    }
    
    function _getCount (callback) {
        pool.query("select count(*) as count from (" + sql + ") counttable", paramArr, function(err, data) {
            // console.log(err, data);
            callback && callback(err, data && data[0] ? data[0].count : 0);
        })
    }

    // 总查询结果
    async.parallel({
        data: _getList,
        count: _getCount
    }, function(err, data) {
        callback(err, data);
    })
}