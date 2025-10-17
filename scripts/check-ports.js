#!/usr/bin/env node

/**
 * Port Check Utility
 * Checks if ports are in use before starting services
 */

const net = require('net');

const requiredPorts = [
  { port: 5173, service: 'Frontend (Vite)' },
  { port: 8000, service: 'Auth Service' },
  { port: 8001, service: 'Scholarship Service' },
  { port: 8002, service: 'Aid Service' },
  { port: 8003, service: 'Monitoring Service' }
];

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve({ port, available: true });
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve({ port, available: false });
    });
  });
}

async function checkAllPorts() {
  console.log(`${colors.bold}${colors.blue}🔍 Checking Port Availability...${colors.reset}\n`);
  
  const results = await Promise.all(requiredPorts.map(({ port, service }) => 
    checkPort(port).then(result => ({ ...result, service }))
  ));
  
  let allAvailable = true;
  
  results.forEach(result => {
    const statusColor = result.available ? colors.green : colors.red;
    const statusIcon = result.available ? '✅' : '❌';
    
    console.log(`${statusIcon} Port ${result.port} (${result.service})`);
    console.log(`   Status: ${statusColor}${result.available ? 'Available' : 'In Use'}${colors.reset}`);
    
    if (!result.available) {
      allAvailable = false;
    }
    console.log('');
  });
  
  if (allAvailable) {
    console.log(`${colors.green}🎉 All ports are available!${colors.reset}`);
  } else {
    console.log(`${colors.red}⚠️  Some ports are in use.${colors.reset}`);
    console.log(`\n${colors.yellow}💡 To free up ports:${colors.reset}`);
    console.log(`   • Find process using port: netstat -ano | findstr :PORT`);
    console.log(`   • Kill process: taskkill /PID PID_NUMBER /F`);
    console.log(`   • Or restart your computer to clear all ports`);
  }
  
  return allAvailable;
}

// Run the port check
checkAllPorts().then(success => {
  process.exit(success ? 0 : 1);
});
