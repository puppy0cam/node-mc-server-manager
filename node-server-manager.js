//server manager
var eventEmitter = new require('events');
var fs = require('fs');
var child_process = require('child_process');
var serverManager = module.exports = {}
serverManager.events = new eventEmitter();
serverManager.getGlobalConfig = function(callback) { //callback provides the contents of the config.
    fs.readFile("./config.JSON", function(error, data) {
        if (error) {
            console.error("config error: generating new config\r\ncallback will return the contents of the default config.");
            var defaultConfig = []
            defaultConfig.push({ //default config that will be generated.
                'name': 'exampleServer',
                'baseDirectory': '/home/useraccount/',
                'RAM': "1024MB",
                'minecraft_jar': '/home/useraccount/minecraft_server.jar'
            });
            
            defaultConfig.push({
                'name': 'my_second_server',
                'baseDirectory': "C:/servertwo",
                'RAM': "2G",
                'minecraft_jar': 'C:/servertwo/jars/spigot.1.3.3.7.jar'
            });
            fs.writeFileSync("./config.JSON", JSON.stringify(defaultConfig), 'utf-8');
            fs.writeFileSync("./exampleServer.log.JSON", JSON.stringify([])); //yeah your gonna need to make the files itself as i found in testing.
            fs.writeFileSync("./my_second_server.log.JSON", JSON.stringify([]));
            process.nextTick(function(){
                callback(defaultConfig);
            });
        } else {
            callback(JSON.parse(data.toString()))
        }
    });
}
serverManager.getGlobalConfig(function(config) { //retrieving the config for the server manager
    serverManager.config = config;
});
serverManager.start = function(serverName) { //sorry it's so messy but pretty much everything had to be crammed in it so you could safely run multiple servers.
    if(typeof(serverName) !== 'string') {return console.log('ERROR: serverName not of valid type. valid types: string\nyour value was of type: ' + typeof(serverName));}
    serverManager.config.forEach(function(currentValue) {
        if (currentValue.name === serverName) {
            console.log("starting: " + currentValue.name);
            var runtime = child_process.spawn("java", [
            "-jar",
            "-Xms" + currentValue.RAM,
            "-Xmx" + currentValue.RAM,
            currentValue.minecraft_jar,
            "nogui"
        ], { 'cwd': currentValue.baseDirectory });
            runtime.stdout.setEncoding("utf8");
            var oldLog = ''
            fs.readFile("./" + currentValue.name + ".log.txt", function(er, dat) {
                if (er) {
                    fs.writeFileSync("./" + currentValue.name + ".log.txt", '\n');
                    oldLog = ''
                } else {
                    oldLog = dat.toString();
                }
            });
            var serverTxtLog = fs.createWriteStream("./" + currentValue.name + ".log.txt");
            serverTxtLog.write(oldLog);
            runtime.stdout.on("data", function(data) {
                var convert = {
                    'time': data.split("] ", 1)[0].slice(1),
                    'type': data.split("] ")[1].split("]: ")[0].slice(1),
                    'message': data.split(": ")[1],
                    'original': data
                }
                serverTxtLog.write(data);
                fs.readFile("./" + currentValue.name + ".log.JSON", 'utf8', function(error, data) {
                    if(error) {
                        fs.writeFile("./" + currentValue.name + ".log.JSON", '[]', 'utf8', function(error, data) {
                            if(error) {
                                console.log(error);
                            }
                        });
                    } else {
                        var logFile = JSON.parse(data.toString());
                        logFile.push(convert);
                        fs.writeFile("./" + currentValue.name + ".log.JSON", JSON.stringify(logFile), 'utf8', function(error, data) {
                            if (error) {
                                console.log(error);
                            }
                        });
                    }
                });
                serverManager.events.emit("log", currentValue.name, convert, runtime);
                /*
                good grief, well now we have the clean events to use
                I know that I could have created functions outside of it
                that used the command event but maybe in a future update instead
                */
            });
            serverManager.events.on('command', function(serverName, command) {
                if(serverName === currentValue.name || serverName === 'all') {
                    runtime.stdin.write(command + '\n');
                }
            });
            serverManager.events.on('save-world', function(serverName) {
                if (serverName === currentValue.name || serverName === 'all') {
                    runtime.stdin.write("save-all\n");
                }
            });
            serverManager.events.on('shutdown', function(servername, reason) {
                if (serverName === currentValue.name || serverName === 'all') {
                    runtime.stdin.write("say shutdown scheduled: 60 seconds\n");
                    if (reason) {runtime.stdin.write("say reason: " + reason + "\n")}
                    setTimeout(function(){
                        runtime.stdin.write("say shutting down\nsave-all\n");
                        setTimeout(function(){
                            runtime.stdin.write("stop\n");
                        },2000);
                    },60000);
                }
            });
        }
    });
}
serverManager.runCommand = function(serverName_, command) {
    serverManager.events.emit("command", serverName_, command);
} //small shortcut so you dont have to emit the event yourself.
serverManager.shutdown = function(serverName, reason) { //this is just being counter-productive with my events. sorry.
    if (reason) {
        serverManager.events.emit('shutdown', serverName, reason);
    } else if (!reason) {
        serverManager.events.emit('shutdown', serverName);
    }
}
serverManager.webServer = require('./webAPI.js'); //pulling up the web API
