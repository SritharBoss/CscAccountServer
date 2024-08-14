var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'CSC Account Server',
  description: 'The nodejs web server for CSC Account Application',
  script: 'index.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();