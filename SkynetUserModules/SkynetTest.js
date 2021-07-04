const SkynetProfileLoader=require('../SkynetModules/SkynetProfilesLoader')
const SkynetLogger=require('../SkynetModules/SkynetLogger')
const SkynetMySQL=require('./SkynetInterfaceforMySQL')
const SkynetCookieParser=require('../SkynetModules/SkynetCookieParser')
const SkynetHttpParser=require('../SkynetModules/SkynetHttpParser')
var Cookies = require('cookies');
var util = require("util");
const http = require('http');
const url = require('url');
const fs=require('fs')
const path=require('path')
const resMime=require('../SkynetModules/SkynetFileTypesMapper')

exports.Test=async function (req,res,data) {
    try 
    {
        var QuyData=SkynetHttpParser.Parse(req,data)
        var ContentType="application/json;chartset='utf8'"
        if(true)
        {
            var ResponseData
		    ResponseData='Test\\CubismSdkTest\\Samples\\TypeScript\\Demo\\Welcome.html';
            return ResponseData
        }
        else
        {
            return 'error.html'
        }
    } 
    catch (error) 
    {
        SkynetLogger.Error(error)
        return 'error.html'
    }
}  
