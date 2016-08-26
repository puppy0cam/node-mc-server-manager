# Node.js Minecraft Server Manager
a minecraft server manager mad by *puppy0cam*
## installation
```bash
npm install node-server-manager
```
## usage
```javascript
const mc = require("node-server-manager");
```
## configuration
there are a few configs that will be generated on the first time you run the manager. this should help guide you through them
### main config (config.JSON)
This has been modified to a readable format.
name represents the server name
the base directory is where to have the server put it's files
RAM is the amount of memory the server has to run
the jar is the path that will lead to the minecraft jar.
```JSON
[
    {
        "name": "exampleServer",
        "baseDirectory": "/home/useraccount/",
        "RAM": "1024MB",
        "minecraft_jar":"/home/useraccount/minecraft_server.jar"
    },
    {
        "name":"my_second_server",
        "baseDirectory":"C:/servertwo",
        "RAM":"2G",
        "minecraft_jar":"C:/servertwo/jars/spigot.1.3.3.7.jar"
    }
]
```
## conclusion
> so then, i think it is simple enough. if you have any problems *PLEASE* open an issue on my GitHub!
