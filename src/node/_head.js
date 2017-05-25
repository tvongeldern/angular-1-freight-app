var express = require("express");
var bodyParser = require("body-parser");
var mysql = require('mysql');
var fs = require('fs');
var cp = require('child_process');
var http = require('http');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

var defaultConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'utpDatabase'
});

var multipleConnection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'utpDatabase',
    multipleStatements: true
});

function responseTypes(request, response) {
    return {
        post: {
            reg: function(er, rw, q){
                if (!er){
                    response.send(rw);
                } else {
                    console.log(er);
                    response.send({error: er, query: q});
                }
            }
        },
        get: {
            reg: function(er, rw, q){
                if (!er){
                    response.send(rw);
                } else {
                    console.log(er);
                    response.send({error: er, query: q});
                }
            }
        },
        put: {
            reg: function(er, rw, q){
                if (!er){
                    response.send(rw);
                } else {
                    console.log(er);
                    console.log(q);
                    response.send({error: er, query: q});
                }
            }
        },
        delete: {
            reg: function(er, rw){
                if (!er){
                    response.send({success: true});
                } else {
                    console.log(er);
                    console.log(q);
                    response.send({error: er, query: q});
                }
            }
        }
    };
};

function dbEndpoint(endpoint, method, settings, construct, customCallback){
    app[method](endpoint, function(request, response){
        var respObj = responseTypes(request, response),
            data = (method.charAt(0) == 'p' ? request.body : request.query);
        var connection = (settings == 'default') ? defaultConnection : settings;

        if (typeof construct == 'function'){
            var query = construct(data);
            connection.query(query, function(err, rows){
                if (!customCallback){
                    respObj[method].reg(err, rows, query);
                } else {
                    customCallback(request.body, response, err, rows);
                }
            });
        } else if (typeof construct == 'string'){
            var path = 'dist/queries/' + construct;
            var callback = function(arg){
                var query = arg.replace(/{{[ ]{0,2}([a-zA-Z0-9\.\_\-]*)[ ]{0,2}}}/g, function(str, mch){ return data[mch]});
                connection.query(query, function(err, rows){
                    if (!customCallback){
                        respObj[method].reg(err, rows, query);
                    } else {
                        customCallback(request.body, response, err, rows);
                    }
                });
            };
            fs.readFile(path, 'utf8', function(err, data){
                if (!err){
                    callback(data);
                } else {
                    callback(err);
                }
            });
        }
    });
};
