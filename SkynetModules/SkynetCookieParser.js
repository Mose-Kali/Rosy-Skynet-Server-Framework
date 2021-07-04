const SkynetLogger=require('./SkynetLogger')

exports.ParseCookies=function (CookieText) {
    if(CookieText==undefined)
    {
        return ""
    }
    var CookieList=CookieText.split(';')
    var CookieMap={}
    CookieList.forEach(Cookie => {
        var cookie=Cookie.split('=')
        CookieMap[String(cookie[0]).replace(' ','')]=cookie[1].replace(' ','')
    });
    return CookieMap
}