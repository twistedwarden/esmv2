#!/usr/bin/env node

/**
 * Service Restart Script
 * Kill and restart specific service by name
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const services = {
  'auth': {
    name: 'Auth Service',
    port: 8000,
    directory: 'microservices/auth_service',
    command: 'php artisan serve --port=8000 --host=127.0.0.1'
  },
  'scholarship': {
    name: 'Scholarship Service',
    port: 8001,
    directory: 'microservices/scholarship_service',
    command: 'php artisan serve --port=8001 --host=127.0.0.1'
  },
  'aid': {
    name: 'Aid Service',
    port: 8002,
    directory: 'microservices/aid_service',
    command: 'php artisan serve --port=8002 --host=127.0.0.1'
  },
  'monitoring': {
    name: 'Monitoring Service',
    port: 8003,
    directory: 'microservices/monitoring_service',
    command: 'php artisan serve --port=8003 --host=127.0.0.1'
  },
  'frontend': {
    name: 'Frontend',
    port: 5173,
    directory: 'GSM',
    command: 'npm run dev'
  }
};

function killProcessOnPort(port) {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout.trim()) {
        console.log(`   No process found on port ${port}`);
        resolve(true);
        return;
      }
      
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[4];
          if (pid && pid !== '0') {
            pids.add(pid);
          }
        }
      });
      
      if (pids.size === 0) {
        console.log(`   No process found on port ${port}`);
        resolve(true);
        return;
      }
      
      console.log(`   Found ${pids.size} process(es) on port ${port}`);
      
      const killPromises = Array.from(pids).map(pid => {
        return new Promise((killResolve) => {
          exec(`taskkill /PID ${pid} /F`, (killError) => {
            if (killError) {
              console.log(`   ${colors.red}Failed to kill PID ${pid}: ${killError.message}${colors.reset}`);
            } else {
              console.log(`   ${colors.green}Killed PID ${pid}${colors.reset}`);
            }
            killResolve();
          });
        });
      });
      
      Promise.all(killPromises).then(() => {
        console.log(`   ${colors.green}Port ${port} cleared${colors.reset}`);
        resolve(true);
      });
    });
  });
}

function startService(service) {
  return new Promise((resolve, reject) => {
    const servicePath = path.resolve(service.directory);
    
    if (!fs.existsSync(servicePath)) {
      reject(new Error(`Service directory not found: ${servicePath}`));
      return;
    }
    
    console.log(`   Starting ${service.name}...`);
    
    const [command, ...args] = service.command.split(' ');
    const child = spawn(command, args, {
      cwd: servicePath,
      stdio: 'pipe',
      shell: true
    });
    
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('error', (error) => {
      reject(error);
    });
    
    // Give the service time to start
    setTimeout(() => {
      if (output.includes('Server running') || output.includes('Local:') || output.includes('ready')) {
        console.log(`   ${colors.green}${service.name} started successfully${colors.reset}`);
        resolve(child);
      } else {
        reject(new Error(`Service failed to start: ${output}`));
      }
    }, 3000);
  });
}

async function restartService(serviceName) {
  const service = services[serviceName.toLowerCase()];
  
  if (!service) {
    console.log(`${colors.red}❌ Unknown service: ${serviceName}${colors.reset}`);
    console.log(`Available services: ${Object.keys(services).join(', ')}`);
    return false;
  }
  
  console.log(`${colors.bold}${colors.blue}🔄 Restarting ${service.name}...${colors.reset}\n`);
  
  try {
    // Kill existing process
    console.log(`1. Killing existing process on port ${service.port}...`);
    await killProcessOnPort(service.port);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start service
    console.log(`2. Starting ${service.name}...`);
    const child = await startService(service);
    
    console.log(`\n${colors.green}✅ ${service.name} restarted successfully!${colors.reset}`);
    console.log(`   URL: http://127.0.0.1:${service.port}`);
    console.log(`   Process ID: ${child.pid}`);
    
    return true;
  } catch (error) {
    console.log(`\n${colors.red}❌ Failed to restart ${service.name}: ${error.message}${colors.reset}`);
    return false;
  }
}

// Parse command line arguments
const serviceName = process.argv[2];

if (!serviceName) {
  console.log(`${colors.bold}${colors.blue}Service Restart Tool${colors.reset}\n`);
  console.log(`Usage: node restart-service.js <service-name>`);
  console.log(`\nAvailable services:`);
  Object.entries(services).forEach(([key, service]) => {
    console.log(`  • ${key} - ${service.name} (port ${service.port})`);
  });
  process.exit(1);
}

// Restart the service
restartService(serviceName).then(success => {
  process.exit(success ? 0 : 1);
});
