var outWeGo = module.exports = {}
var express = require('express');
var path = require('path');
var fs = require('fs');
outWeGo.app = express();
outWeGo.app.get('/API/logs', function (req, res) {
    outWeGo.req = req;
    outWeGo.res = res;
  if (!req.params.server && !req.headers.server && !req.query.server) {
      res.status(204).send('{\n    "error": "server not specified",\n    "flavourText": "What Do You Mean?"\n}'); //because why not make it a bit fun
  } else {
      if (req.query.server) {
          var par = req.query.server;
      } else if (req.params.server) {
          var par = req.params.server;
      } else if (req.headers.server) {
          var par = req.headers.server;
      }
      if (req.query.format) {
          var had = req.query.format;
      } else if (req.params.format) {
          var had = req.params.format;
      } else if (req.headers.format) {
          var had = req.headers.format;
      } else {
          var had = "txt" //default type to return
      }
      if (par === 'all') {
          res.status(403).sendFile(path.join(process.cwd() + path.sep + 'triggered.jpg'));
      } else {
          res.sendFile(path.join(process.cwd(), './' + par + '.log.' + had));
/*
let me know if these don't work on any computers in my github.
this was coded with windows as the testing ground so linux testers please thanks :D          
*/
      }
  }
});
outWeGo.app.get('/API/servers', function(req, res) {
    fs.readFile('./config.JSON', function(error, data) {
        var config = JSON.parse(data);
        var servers = [];
        config.forEach(function(currentValue) {
            servers.push(currentValue.name);
        });
        process.nextTick(function() {
            res.send(JSON.stringify(servers));
        });
    });
});
outWeGo.app.get('/API/players', function(req, res) { //WIP
    module.parent.exports.events.emit("command", "all", "list"); //WIP
    res.send("all servers have now run the list command."); //WIP
}); //WIP

outWeGo.app.listen(8080, function () {
  console.log('logging server started on port: 8080');
});
