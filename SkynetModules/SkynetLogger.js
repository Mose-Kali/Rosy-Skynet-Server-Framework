const chalk = require('chalk');
const ProfilesLoader = require('./SkynetProfilesLoader')

var DebugMode = ProfilesLoader.LoadSystemProfile().SkynetSystem.DebugMode

exports.Log = function (Text) {
    if (DebugMode) {
        console.log('[LOG]' + Text)
    }
}

exports.LogR = function (Text) {
    console.log('[LOG]' + Text)
}

exports.Error = function (ErrText) {
    if (DebugMode) {
        console.error(chalk.red('[ERROR]' + String(ErrText)))
    }
}

exports.Warn = function (WarnText) {
    if (DebugMode) {
        console.warn(chalk.yellow('[WARNING]' + String(WarnText)))
    }
}

exports.Logo = function Logo(WarnText) {
    console.log(chalk.blue(String(WarnText)))
}