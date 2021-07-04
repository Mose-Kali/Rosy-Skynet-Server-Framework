const fs = require('fs')

let SkynetSystemProfile = JSON.parse(fs.readFileSync(__dirname+'/SkynetConfigs/SkynetSystemProfiles/SkynetSystemProfiles.json', 'utf-8'))

exports.LoadSystemProfile = function ()
{
    return SkynetSystemProfile
}

exports.LoadControllerMapper = function ()
{
    let SkynetControllerMapper=JSON.parse(fs.readFileSync(__dirname+'\\SkynetConfigs\\'+SkynetSystemProfile.SkynetSystem.ControllerMapper, 'utf-8'))
    return SkynetControllerMapper
}