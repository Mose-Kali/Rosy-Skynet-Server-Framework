const fs = require('fs')
const readline = require('readline');
const path = require('path')
const SkynetCompilerLogger = require('./SkynetLogger')

const args = process.argv.slice(2)

function CompileFile(SourcePath) {
    fs.writeFileSync('.\\out\\SkynetControllerMapper.json', '{}')
    var FunctionMapper = JSON.parse(fs.readFileSync('.\\out\\SkynetControllerMapper.json'))
    SkynetCompilerLogger.Log('Skynet Server Side Controller Compiler Ready')
    var OutFileName = SourcePath.replace('.snsc', '.js')
    OutFileName = OutFileName.substring(OutFileName.lastIndexOf('\\') + 1)
    SkynetCompilerLogger.Log('Iutput File:' + SourcePath)
    SkynetCompilerLogger.Log('Output File:out\\' + OutFileName)
    fs.writeFileSync('.\\out\\' + OutFileName, fs.readFileSync('.\\SkynetFileTemplate.snft'));
    const rl = readline.createInterface({
        input: fs.createReadStream(SourcePath),
        output: process.stdout,
        terminal: false
    });
    var FunctionContent = []
    rl.on('line', (line) => {
        if (line == '}') {
            for (let i = 0; i < FunctionContent.length; i++) {
                const element = FunctionContent[i];
                if (element == '\r\n') {
                    delete FunctionContent[i]
                    i--
                }
            }
            let index = 0
            for (; index < FunctionContent.length; index++) {
                const element = FunctionContent[index];
                if (element == '{') {
                    index -= 1;
                    break;
                }
            }
            var types = FunctionContent[index].split('@');
            var idxs = types[0].indexOf('(')
            types[1].replace('{', '')
            var FunctionPath = FunctionContent[index].substr(0, idxs)
            var FunctionName = FunctionPath
            FunctionPath = FunctionPath.replace(/\_/g, '/')
            SkynetCompilerLogger.Log('Compiling Function \'' + FunctionName + "',Path:'" + FunctionPath + "'  ...")
            var FunctionArgStr = FunctionContent[index].substring(idxs + 1, FunctionContent[index].indexOf(')'))
            var IfReplace = 'true'
            var getArgsList = []
            if (FunctionArgStr != '' && FunctionArgStr != undefined) {
                var FunctionArgs = FunctionArgStr.split(',')
                SkynetCompilerLogger.Log('Function Arguments :' + FunctionArgs)
                IfReplace = "QuyData.Type!='No-Data'&&QuyData.Type!='Raw'"
                for (let i = 0; i < FunctionArgs.length; i++) {
                    const element = FunctionArgs[i];
                    var Code = "var " + element + "=QuyData.Data['" + element + "']"
                    getArgsList.push(Code)
                    IfReplace += "&&"
                    IfReplace += "QuyData.Data['" + element + "']!=undefined"
                }
            }
            var FunctionBody = []
            index += 2
            for (; index < FunctionContent.length; index++) {
                const element = FunctionContent[index];
                if (element == '}') {
                    break;
                }
                FunctionBody.push(element)
            }
            try {
                if (types[1] == 'restful') {
                    const data = fs.readFileSync('.\\SkynetRestfulFunctionTemplate.snct', 'UTF-8');
                    const lines = data.split(/\r?\n/);
                    lines.forEach((line) => {
                        var LineCode = line
                        LineCode = LineCode.replace('%%%%%%', FunctionName)
                        LineCode = LineCode.replace('$$$$$$', IfReplace)
                        if (LineCode.indexOf('@@@@@@') != -1) {
                            getArgsList.forEach(element => {
                                fs.appendFileSync('.\\out\\' + OutFileName, "\t\t" + element + "\r\n");
                            });
                        }
                        else if (LineCode.indexOf('######') != -1) {
                            FunctionBody.forEach(element => {
                                fs.appendFileSync('.\\out\\' + OutFileName, "\t\t" + element + "\r\n");
                            });
                        }
                        else {
                            fs.appendFileSync('.\\out\\' + OutFileName, LineCode + "\r\n");
                        }
                    });
                }
                else if (types[1] == 'view') {
                    const data = fs.readFileSync('.\\SkynetViewFunctionTemplate.snct', 'UTF-8');
                    const lines = data.split(/\r?\n/);
                    lines.forEach((line) => {
                        var LineCode = line
                        LineCode = LineCode.replace('%%%%%%', FunctionName)
                        LineCode = LineCode.replace('$$$$$$', IfReplace)
                        if (LineCode.indexOf('@@@@@@') != -1) {
                            getArgsList.forEach(element => {
                                fs.appendFileSync('.\\out\\' + OutFileName, "\t\t" + element + "\r\n");
                            });
                        }
                        else if (LineCode.indexOf('######') != -1) {
                            FunctionBody.forEach(element => {
                                fs.appendFileSync('.\\out\\' + OutFileName, "\t\t" + element + "\r\n");
                            });
                        }
                        else {
                            fs.appendFileSync('.\\out\\' + OutFileName, LineCode + "\r\n");
                        }
                    });
                }
            } catch (err) {
                SkynetCompilerLogger.Error(err);
            }
            FunctionMapper['/' + FunctionPath] = {
                "Type": types[1],
                "Function": FunctionName,
                "Module": OutFileName
            }
            fs.writeFileSync('.\\out\\SkynetControllerMapper.json', JSON.stringify(FunctionMapper))
            FunctionContent = []
        }
        else {
            FunctionContent.push(line)
        }
    });
}

if (args[0] == '-f') {
    CompileFile(args[1])
}
if (args[0] == '-d') {
    var list = fs.readdirSync(args[1])
    list.forEach(function (file) {
        file = args[1] + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) {
        } else {
            if (path.extname(file) === '.snsc') {
                var p = path.resolve(__dirname, file)
                CompileFile(p)
            }
        }
    })
}
process.on('exit', (code) => {
    SkynetCompilerLogger.Log(`Done,Exit Code: ${code}`);
});