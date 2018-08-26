'use strict';

var http = require('http'),
httpProxy = require('http-proxy');

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

// To modify the proxy connection before data is sent, you can listen
// for the 'proxyReq' event. When the event is fired, you will receive
// the following arguments:
// (http.ClientRequest proxyReq, http.IncomingMessage req,
//  http.ServerResponse res, Object options). This mechanism is useful when
// you need to modify the proxy request before the proxy connection
// is made to the target.
//
proxy.on('proxyReq', function(proxyReq, req, res, options) {
//console.log('in proxyReq:' + req.rawHeaders);
});

proxy.on('proxyRes', function(proxyRes, req, res, options) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', true);
});

// main front-server
var server = http.createServer(function(req, res) {
    try {
        if (req.method === 'OPTIONS') {
            // preFlight request, proxy to mock server
            proxy.web(req, res, {
                target: 'http://localhost:8090'
            });
            return;
        }
        
        // api request, proxy to target backend-server
        proxy.web(req, res, {
            target: 'http://localhost:8080'
        });
    }catch(e) {
        console.log(e);
    }
});


//
// Create a mock server to handle preFlight request of CORS-protocol
//
http.createServer(function (req, res) {
    res.writeHead(200,
        { 'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': true});
    res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 4));
    res.end();
}).listen(8090);

console.log("listening on port 18080")
server.listen(18080);