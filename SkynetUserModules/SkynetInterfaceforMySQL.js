const mysql=require('mysql')
const SkynetLogger=require("../SkynetModules/SkynetLogger")
const SkynetProfileLoader=require('../SkynetModules/SkynetProfilesLoader')

var mysqlconnectconfig=SkynetProfileLoader.LoadSystemProfile().MySQL
const pool = mysql.createPool(mysqlconnectconfig)

let querySQL = function( sql, values ) {
    SkynetLogger.Log('Call MySQL Database')
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {

          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })
}

module.exports.query =  querySQL

exports.Select=function (Column,Table,Limit) {
    return querySQL("SELECT ? FROM ? WHERE ?",{Column,Table,Limit})
}