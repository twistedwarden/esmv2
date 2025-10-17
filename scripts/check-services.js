#!/usr/bin/env node

/**
 * Service Health Check Script
 * Tests connectivity to all microservices and reports status
 */

const http = require('http');
const https = require('https');

const services = [
  { name: 'Auth Service', url: 'http://127.0.0.1:8000/api/health', port: 8000 },
  { name: 'Scholarship Service', url: 'http://127.0.0.1:8001/api/health', port: 8001 },
  { name: 'Aid Service', url: 'http://127.0.0.1:8002/api/health', port: 8002 },
  { name: 'Monitoring Service', url: 'http://127.0.0.1:8003/api/health', port: 8003 },
  { name: 'Frontend', url: 'http://localhost:5173', port: 5173 }
];

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function checkService(service) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(service.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      resolve({
        name: service.name,
        port: service.port,
        status: 'online',
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        url: service.url
      });
    });

    req.on('error', (err) => {
      resolve({
        name: service.name,
        port: service.port,
        status: 'offline',
        error: err.message,
        url: service.url
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: service.name,
        port: service.port,
        status: 'timeout',
        error: 'Request timeout',
        url: service.url
      });
    });

    req.end();
  });
}

async function checkAllServices() {
  console.log(`${colors.bold}${colors.blue}🔍 Checking Service Health...${colors.reset}\n`);
  
  const results = await Promise.all(services.map(checkService));
  
  let allOnline = true;
  
  results.forEach(result => {
    const statusColor = result.status === 'online' ? colors.green : colors.red;
    const statusIcon = result.status === 'online' ? '✅' : '❌';
    
    console.log(`${statusIcon} ${colors.bold}${result.name}${colors.reset} (Port ${result.port})`);
    console.log(`   URL: ${result.url}`);
    
    if (result.status === 'online') {
      console.log(`   Status: ${statusColor}${result.statusCode}${colors.reset} - ${result.responseTime}`);
    } else {
      console.log(`   Status: ${statusColor}${result.status}${colors.reset}`);
      if (result.error) {
        console.log(`   Error: ${colors.red}${result.error}${colors.reset}`);
      }
      allOnline = false;
    }
    console.log('');
  });
  
  if (allOnline) {
    console.log(`${colors.green}🎉 All services are online!${colors.reset}`);
  } else {
    console.log(`${colors.red}⚠️  Some services are offline. Check the errors above.${colors.reset}`);
    console.log(`\n${colors.yellow}💡 Quick fixes:${colors.reset}`);
    console.log(`   • Start auth service: cd microservices/auth_service && php artisan serve --port=8000`);
    console.log(`   • Start scholarship service: cd microservices/scholarship_service && php artisan serve --port=8001`);
    console.log(`   • Start aid service: cd microservices/aid_service && php artisan serve --port=8002`);
    console.log(`   • Start monitoring service: cd microservices/monitoring_service && php artisan serve --port=8003`);
    console.log(`   • Start frontend: cd GSM && npm run dev`);
  }
  
  return allOnline;
}

// Run the health check
checkAllServices().then(success => {
  process.exit(success ? 0 : 1);
});
