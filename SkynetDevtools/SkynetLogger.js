const chalk = require('chalk');

exports.Log = function (Text)
{
    console.log('[LOG]'+Text)
}

exports.Error = function (ErrText)
{
    console.error(chalk.red('[ERROR]'+String(ErrText)))
}

exports.Warn = function (WarnText)
{
    console.warn(chalk.yellow('[WARNING]'+String(WarnText)))
}

exports.Logo = function Logo(WarnText)
{
    console.log(chalk.blue(String(WarnText)))
}