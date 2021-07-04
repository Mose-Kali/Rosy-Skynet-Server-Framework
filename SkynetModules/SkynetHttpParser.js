const SkynetLogger = require('./SkynetLogger')
const http = require('http')
var urlencode = require('urlencode');
const url = require('url');

exports.Parse = function (req, data) {
    var PostData = {}
    if (req == undefined || data == undefined || data == "" || req == "") {
        PostData['Type'] = 'No-Data'
        if (url.parse(req.url, true).query != null) {
            PostData['Data'] = url.parse(req.url, true).query
            PostData['Type'] = 'X-WWW-Form-Urlencoded'
        }
        return PostData
    }
    if (req.headers['content-type'] == 'text/plain') {
        PostData['Type'] = 'Raw'
        PostData['Data'] = String(data)
        return PostData
    }
    if (req.headers['content-type'].indexOf('application/x-www-form-urlencoded') != -1) {
        PostData['Data'] = url.parse(req.url, true).query
        var Dts = urlencode.decode(data).split('&')
        var dtt = {}
        Dts.forEach(Dt => {
            var dt = Dt.split('=')
            dtt[dt[0]] = dt[1]
        });
        PostData['Type'] = 'X-WWW-Form-Urlencoded'
        PostData['Data'] = dtt
        return PostData
    }
    else {
        var cont = String(req.headers['content-type']).split(';')
        if (cont[0] == 'multipart/form-data') {
            PostData['Data'] = url.parse(req.url, true).query
            var dtt = {}
            var sp = cont[1].split('=')[1]
            var dt = String(data).split(sp)
            for (let index = 1; index < dt.length - 1; index++) {
                const element = dt[index];
                var idxs = element.indexOf('"')
                var idxe = element.indexOf('"', idxs + 1)
                var n = element.substr(idxs + 1, idxe - idxs - 1)
                var name = element.split('\"')
                var Parts = name[2].split('\r\n\r\n')
                var dta = Parts[1].split('\r\n--')[0]
                dtt[n] = dta
            }
            PostData['Type'] = 'Form-Data'
            PostData['Data'] = dtt
            return PostData
        }
    }
}