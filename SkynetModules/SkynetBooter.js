const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const ProfilesLoader = require('./SkynetProfilesLoader')
const ModuleLoader = require('./SkynetModulesLoader')
const Logger = require('./SkynetLogger')
const resMime = require('./SkynetFileTypesMapper')
const SkynetMySQL = require('../SkynetUserModules/SkynetInterfaceforMySQL')
var util = require("util");

var server

exports.SkynetBoot = function (RequestCallback, ResponseCallback, dirname, BootCallback) {
    /*
    '     _____ _                     _      _____                          
    '    / ____| |                   | |    / ____|                         
    '   | (___ | | ___   _ _ __   ___| |_  | (___   ___ _ ____   _____ _ __ 
    '    \___ \| |/ / | | | '_ \ / _ \ __|  \___ \ / _ \ '__\ \ / / _ \ '__|
    '    ____) |   <| |_| | | | |  __/ |_   ____) |  __/ |   \ V /  __/ |   
    '   |_____/|_|\_\\__, |_| |_|\___|\__| |_____/ \___|_|    \_/ \___|_|   
    '                 __/ |                                                 
    '                |___/                                                  
    */
    Logger.Logo('     _____ _                     _      _____                          ')
    Logger.Logo('    / ____| |                   | |    / ____|                         ')
    Logger.Logo('   | (___ | | ___   _ _ __   ___| |_  | (___   ___ _ ____   _____ _ __ ')
    Logger.Logo('    \\___ \\| |/ / | | | \'_ \\ / _ \\ __|  \\___ \\ / _ \\ \'__\\ \\ / / _ \ \'__|')
    Logger.Logo('    ____) |   <| |_| | | | |  __/ |_   ____) |  __/ |   \\ V /  __/ |   ')
    Logger.Logo('   |_____/|_|\\_\\\\__, |_| |_|\\___|\\__| |_____/ \\___|_|    \\_/ \\___|_|   ')
    Logger.Logo('                 __/ |                                                 ')
    Logger.Logo('                |___/                                                  ')
    if (BootCallback != undefined) {
        BootCallback()
    }
    server = http.createServer(function (req, res) {
        Logger.Log('Skynet Accept Request')
        try {
            let pathName = url.parse(req.url).pathname;
            if (req.headers['content-length'] == undefined || req.headers['content-length'] == 0) {
                // if (pathName != '/favicon.ico') 
                {
                    let pathName = url.parse(req.url).pathname;
                    var ControllerMapper = ProfilesLoader.LoadControllerMapper()
                    var ControllerData = ControllerMapper[pathName]
                    if (ControllerData != undefined) {
                        if (ControllerData.Type == 'restful') {
                            var module = ModuleLoader.SkynetLoadModule(dirname + '\\SkynetUserModules\\' + ControllerData.Module)
                            if (typeof (eval('module.' + ControllerData.Function)) == "function") {
                                var ResponseBody = {}
                                if (RequestCallback != null) {
                                    RequestCallback(req, res)
                                }
                                eval('ResponseBody=module.' + ControllerData.Function + "(req,res,undefined)");
                                if (ResponseCallback != null) {
                                    ResponseBody = ResponseCallback(req, res, ResponseBody)
                                }
                                // if(!ResponseBody||ResponseBody==undefined||ResponseBody=="")
                                // {
                                //     res.writeHead(201,{"Content-Type":"application/json;chartset='utf8'"})
                                //     res.write(ResponseBody==''||ResponseBody==undefined?"{\"status\":\"error\"}":ResponseBody);
                                //     res.end();
                                // }
                            }
                            else {
                                // 函数不存在
                                Logger.Error('Function \'' + ControllerData.Function + '\' was not Found')
                                if (RequestCallback != null) {
                                    RequestCallback(req, res)
                                }

                                if (ResponseCallback != null) {
                                    var ResponseBody = ResponseCallback(req, res, ResponseBody)
                                }
                                res.writeHead(201, { "Content-Type": "application/json;chartset='utf8'" })
                                res.write('{"status":"ready","data":{"Error":true,"Note":"Cannot Find Module","Success":false}}');
                                res.end()
                            }
                        }
                        else if (ControllerData.Type == 'view') {
                            var module = ModuleLoader.SkynetLoadModule(dirname + '\\SkynetUserModules\\' + ControllerData.Module)
                            if (typeof (eval('module.' + ControllerData.Function)) == "function") {
                                var ResponseBody = {}
                                if (RequestCallback != null) {
                                    RequestCallback(req, res)
                                }
                                eval('ResponseBody=module.' + ControllerData.Function + "(req,res,undefined)");
                                ResponseBody.then(function (ResponseData) {
                                    let extName = path.extname(ResponseData);
                                    fs.readFile(path.join(dirname + "\\SkynetResources\\SkynetFileSystem", ResponseData), function (err, data) {
                                        if (err) {
                                            Logger.Error(err);
                                            res.writeHead(404, { "Content-Type": "text/html;chartset='utf8'" })
                                            res.write("<html>404 Not found</html>");
                                            res.end();
                                        } else {
                                            var mime = resMime.getMime(fs, extName);
                                            if (RequestCallback != null) {
                                                RequestCallback(req, res)
                                            }
                                            res.writeHead(200, {
                                                "Content-Type": `${mime};chartset='utf8'`, 'Access-Control-Allow-Credentials': true,
                                                'Access-Control-Allow-Origin': '*'
                                            });
                                            if (ResponseCallback != null) {
                                                data = ResponseCallback(req, res, data)
                                            }
                                            res.write(data);
                                            res.end();
                                        }
                                    });
                                }).catch(function (err) {
                                    Logger.Error(err);
                                    res.writeHead(404, { "Content-Type": "text/html;chartset='utf8'" })
                                    res.write("<html>404 Not found</html>");
                                    res.end();
                                });
                                // if(!ResponseBody||ResponseBody==undefined||ResponseBody=="")
                                // {
                                //     res.writeHead(201,{"Content-Type":"application/json;chartset='utf8'"})
                                //     res.write(ResponseBody==''||ResponseBody==undefined?"{\"status\":\"error\"}":ResponseBody);
                                //     res.end();
                                // }
                            }
                            else {
                                // 函数不存在
                                Logger.Error('Function \'' + ControllerData.Function + '\' was not Found')
                                if (RequestCallback != null) {
                                    RequestCallback(req, res)
                                }
                                if (ResponseCallback != null) {
                                    var ResponseBody = ResponseCallback(req, res, ResponseBody)
                                }
                                res.writeHead(404, { "Content-Type": "text/html;chartset='utf8'" })
                                res.write("<html>404 Not found</html>");
                                res.end();
                            }
                        }
                    }
                    else {
                        let extName = path.extname(pathName);
                        fs.readFile(path.join(dirname + "\\SkynetResources\\SkynetFileSystem", pathName), function (err, data) {
                            if (err) {
                                if (RequestCallback != null) {
                                    RequestCallback(req, res)
                                }
                                Logger.Error(err);
                                res.writeHead(404, { "Content-Type": "text/html;chartset='utf8'" })
                                res.write("<html>404 Not found</html>");
                                res.end();
                            } else {
                                var mime = resMime.getMime(fs, extName);
                                if (RequestCallback != null) {
                                    RequestCallback(req, res)
                                }
                                res.writeHead(200, {
                                    "Content-Type": `${mime};chartset='utf8'`, 'Access-Control-Allow-Credentials': true,
                                    'Access-Control-Allow-Origin': '*'
                                });
                                if (ResponseCallback != null) {
                                    data = ResponseCallback(req, res, data)
                                }
                                res.write(data);
                                res.end();
                            }
                        });
                    }
                }
                // else {
                //     let extName = path.extname(dirname + '\\SkynetResources\\favicon.ico');
                //     fs.readFile(path.join(dirname , '\\SkynetResources\\favicon.ico'), function (err, data) {
                //         if (err) {
                //             if (RequestCallback != null) {
                //                 RequestCallback(req, res)
                //             }
                //             Logger.Error(err)
                //             res.writeHead(201, { "Content-Type": "application/json;chartset='utf8'" })
                //             res.write('{"status":"ready","data":{"Error":true,"Note":"Route Server Error","Success":false}}');
                //             res.end()
                //         } else {
                //             var mime = resMime.getMime(fs, extName);
                //             if (RequestCallback != null) {
                //                 RequestCallback(req, res)
                //             }
                //             res.writeHead(200, {
                //                 "Content-Type": `${mime};chartset='utf8'`, 'Access-Control-Allow-Credentials': true,
                //                 'Access-Control-Allow-Origin': '*'
                //             });
                //             if (ResponseCallback != null) {
                //                 data = ResponseCallback(req, res, data)
                //             }
                //             console.log(data);
                //             res.write(data);
                //             res.end();
                //         }
                //     });
                // }
            }
        }
        catch (err) {
            Logger.Error(err);
            res.writeHead(201, { "Content-Type": "application/json;chartset='utf8'" })
            res.write('{"status":"ready","data":{"Error":true,"Note":"Something Error","Success":false}}');
            res.end()
        }
        req.on('data', async (chunk) => {
            try {
                let pathName = url.parse(req.url).pathname;
                // if (pathName != '/favicon.ico') 
                {
                    let pathName = url.parse(req.url).pathname;
                    var ControllerMapper = ProfilesLoader.LoadControllerMapper()
                    var ControllerData = ControllerMapper[pathName]
                    if (ControllerData != undefined) {
                        if (ControllerData.Type == 'restful') {
                            var module = ModuleLoader.SkynetLoadModule(dirname + '\\SkynetUserModules\\' + ControllerData.Module)
                            if (typeof (eval('module.' + ControllerData.Function)) == "function") {
                                var ResponseBody = {}
                                if (RequestCallback != null) {
                                    RequestCallback(req, res)
                                }
                                eval('ResponseBody=module.' + ControllerData.Function + "(req,res,chunk)");
                                if (ResponseCallback != null) {
                                    ResponseBody = ResponseCallback(req, res, ResponseBody)
                                }
                                // if(!ResponseBody||ResponseBody==undefined||ResponseBody=="")
                                // {
                                //     res.writeHead(201,{"Content-Type":"application/json;chartset='utf8'"})
                                //     res.write(ResponseBody==''||ResponseBody==undefined?"{\"status\":\"error\"}":ResponseBody);
                                //     res.end();
                                // }
                            }
                            else {
                                // 函数不存在
                                Logger.Error('Function \'' + ControllerData.Function + '\' was not Found')
                                if (RequestCallback != null) {
                                    RequestCallback(req, res)
                                }
                                if (ResponseCallback != null) {
                                    var ResponseBody = ResponseCallback(req, res, ResponseBody)
                                }
                                res.writeHead(201, { "Content-Type": "application/json;chartset='utf8'" })
                                res.write('{"status":"ready","data":{"Error":true,"Note":"Route Server Error","Success":false}}');
                                res.end()
                            }
                        }
                        else if (ControllerData.Type == 'view') {
                            var module = ModuleLoader.SkynetLoadModule(dirname + '\\SkynetUserModules\\' + ControllerData.Module)
                            if (typeof (eval('module.' + ControllerData.Function)) == "function") {
                                var ResponseBody = {}
                                if (RequestCallback != null) {
                                    RequestCallback(req, res)
                                }
                                eval('ResponseBody=module.' + ControllerData.Function + "(req,res,chunk)");
                                ResponseBody.then(function (ResponseData) {
                                    let extName = path.extname(ResponseData);
                                    fs.readFile(path.join(dirname + "\\SkynetResources\\SkynetFileSystem", ResponseData), function (err, data) {
                                        if (err) {
                                            Logger.Error(err);
                                            res.writeHead(404, { "Content-Type": "text/html;chartset='utf8'" })
                                            res.write("<html>404 Not found</html>");
                                            res.end();
                                        } else {
                                            var mime = resMime.getMime(fs, extName);
                                            if (RequestCallback != null) {
                                                RequestCallback(req, res)
                                            }
                                            res.writeHead(200, {
                                                "Content-Type": `${mime};chartset='utf8'`, 'Access-Control-Allow-Credentials': true,
                                                'Access-Control-Allow-Origin': '*'
                                            });
                                            if (ResponseCallback != null) {
                                                data = ResponseCallback(req, res, data)
                                            }
                                            res.write(data);
                                            res.end();
                                        }
                                    });
                                }).catch(function (err) {
                                    Logger.Error(err);
                                    res.writeHead(404, { "Content-Type": "text/html;chartset='utf8'" })
                                    res.write("<html>404 Not found</html>");
                                    res.end();
                                });
                                // if(!ResponseBody||ResponseBody==undefined||ResponseBody=="")
                                // {
                                //     res.writeHead(201,{"Content-Type":"application/json;chartset='utf8'"})
                                //     res.write(ResponseBody==''||ResponseBody==undefined?"{\"status\":\"error\"}":ResponseBody);
                                //     res.end();
                                // }
                            }
                            else {
                                // 函数不存在
                                Logger.Error('Function \'' + ControllerData.Function + '\' was not Found')
                                if (RequestCallback != null) {
                                    RequestCallback(req, res)
                                }
                                if (ResponseCallback != null) {
                                    var ResponseBody = ResponseCallback(req, res, ResponseBody)
                                }
                                res.writeHead(404, { "Content-Type": "text/html;chartset='utf8'" })
                                res.write("<html>404 Not found</html>");
                                res.end();
                            }
                        }
                    }
                    else {
                        let extName = path.extname(pathName);
                        fs.readFile(path.join(dirname + "\\SkynetResources\\SkynetFileSystem", pathName), function (err, data) {
                            if (err) {
                                if (RequestCallback != null) {
                                    RequestCallback(req, res)
                                }
                                Logger.Error(err);
                                res.writeHead(404, { "Content-Type": "text/html;chartset='utf8'" })
                                res.write("<html>404 Not found</html>");
                                res.end();
                            } else {
                                var mime = resMime.getMime(fs, extName);
                                if (RequestCallback != null) {
                                    RequestCallback(req, res)
                                }
                                res.writeHead(200, {
                                    "Content-Type": `${mime};chartset='utf8'`, 'Access-Control-Allow-Credentials': true,
                                    'Access-Control-Allow-Origin': '*'
                                });
                                if (ResponseCallback != null) {
                                    data = ResponseCallback(req, res, data)
                                }
                                res.write(data);
                                res.end();
                            }
                        });
                    }
                }
                // else {
                //     let extName = path.extname(dirname + '\\SkynetResources\\favicon.ico');
                //     console.log(dirname + '\\SkynetResources\\favicon.ico')
                //     fs.readFile(dirname + '\\SkynetResources\\favicon.ico', function (err, data) {
                //         if (err) {
                //             if (RequestCallback != null) {
                //                 RequestCallback(req, res)
                //             }
                //             res.writeHead(201, { "Content-Type": "application/json;chartset='utf8'" })
                //             res.write('{"status":"ready","data":{"Error":true,"Note":"Route Server Error","Success":false}}');
                //             res.end()
                //         } else {
                //             var mime = resMime.getMime(fs, extName);
                //             if (RequestCallback != null) {
                //                 RequestCallback(req, res)
                //             }
                //             res.writeHead(200, {
                //                 "Content-Type": `${mime};chartset='utf8'`, 'Access-Control-Allow-Credentials': true,
                //                 'Access-Control-Allow-Origin': '*'
                //             });
                //             if (ResponseCallback != null) {
                //                 data = ResponseCallback(req, res, data)
                //             }
                //             res.write(data);
                //             res.end();
                //         }
                //     })
                // }
            }
            catch (err) {
                Logger.Error(err);
                res.writeHead(201, { "Content-Type": "application/json;chartset='utf8'" })
                res.write('{"status":"ready","data":{"Error":true,"Note":"Route Server Error","Success":false}}');
                res.end()
            }
        })
        Logger.Log('Skynet Responsed')
    });
    Logger.LogR('Skynet Ready!')
}

exports.SkynetListen = function () {
    var SkynetPort = ProfilesLoader.LoadSystemProfile().SkynetSystem.Port
    server.listen(SkynetPort)
    Logger.LogR('Listen on Port ' + SkynetPort)
}

process.on('uncaughtException', function (err) {
    Logger.Error(err);
    Logger.Error(err.stack)
});