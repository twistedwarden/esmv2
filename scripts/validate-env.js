#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates all .env files exist and have required variables
 */

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

const envConfigs = [
  {
    path: 'GSM/.env',
    required: [
      'VITE_API_BASE_URL',
      'VITE_GOOGLE_CLIENT_ID',
      'VITE_BREVO_API_KEY'
    ],
    optional: [
      'VITE_DEBUG_MODE',
      'VITE_SHOW_OTP_IN_DEV',
      'VITE_APP_NAME',
      'VITE_APP_VERSION'
    ],
    service: 'Frontend'
  },
  {
    path: 'microservices/auth_service/.env',
    required: [
      'APP_NAME',
      'APP_ENV',
      'APP_KEY',
      'APP_DEBUG',
      'APP_URL',
      'DB_CONNECTION'
    ],
    optional: [
      'DB_HOST',
      'DB_PORT',
      'DB_DATABASE',
      'DB_USERNAME',
      'DB_PASSWORD',
      'BREVO_API_KEY',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ],
    service: 'Auth Service'
  },
  {
    path: 'microservices/scholarship_service/.env',
    required: [
      'APP_NAME',
      'APP_ENV',
      'APP_KEY',
      'APP_DEBUG',
      'APP_URL',
      'DB_CONNECTION'
    ],
    optional: [
      'DB_HOST',
      'DB_PORT',
      'DB_DATABASE',
      'DB_USERNAME',
      'DB_PASSWORD'
    ],
    service: 'Scholarship Service'
  },
  {
    path: 'microservices/aid_service/.env',
    required: [
      'APP_NAME',
      'APP_ENV',
      'APP_KEY',
      'APP_DEBUG',
      'APP_URL',
      'DB_CONNECTION'
    ],
    optional: [
      'DB_HOST',
      'DB_PORT',
      'DB_DATABASE',
      'DB_USERNAME',
      'DB_PASSWORD'
    ],
    service: 'Aid Service'
  },
  {
    path: 'microservices/monitoring_service/.env',
    required: [
      'APP_NAME',
      'APP_ENV',
      'APP_KEY',
      'APP_DEBUG',
      'APP_URL',
      'DB_CONNECTION'
    ],
    optional: [
      'DB_HOST',
      'DB_PORT',
      'DB_DATABASE',
      'DB_USERNAME',
      'DB_PASSWORD'
    ],
    service: 'Monitoring Service'
  }
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

function validateEnvConfig(config) {
  const env = parseEnvFile(config.path);
  const results = {
    service: config.service,
    path: config.path,
    exists: !!env,
    missing: [],
    present: [],
    warnings: []
  };
  
  if (!env) {
    results.missing = config.required;
    return results;
  }
  
  // Check required variables
  config.required.forEach(key => {
    if (env[key] && env[key].trim() !== '') {
      results.present.push(key);
    } else {
      results.missing.push(key);
    }
  });
  
  // Check optional variables
  config.optional.forEach(key => {
    if (env[key] && env[key].trim() !== '') {
      results.present.push(key);
    } else {
      results.warnings.push(key);
    }
  });
  
  return results;
}

async function validateAllEnvs() {
  console.log(`${colors.bold}${colors.blue}🔍 Validating Environment Files...${colors.reset}\n`);
  
  const results = envConfigs.map(validateEnvConfig);
  let allValid = true;
  
  results.forEach(result => {
    const statusIcon = result.exists && result.missing.length === 0 ? '✅' : '❌';
    const statusColor = result.exists && result.missing.length === 0 ? colors.green : colors.red;
    
    console.log(`${statusIcon} ${colors.bold}${result.service}${colors.reset}`);
    console.log(`   File: ${result.path}`);
    console.log(`   Status: ${statusColor}${result.exists ? 'Found' : 'Missing'}${colors.reset}`);
    
    if (result.missing.length > 0) {
      console.log(`   ${colors.red}Missing required variables:${colors.reset}`);
      result.missing.forEach(key => {
        console.log(`     • ${key}`);
      });
      allValid = false;
    }
    
    if (result.warnings.length > 0) {
      console.log(`   ${colors.yellow}Optional variables not set:${colors.reset}`);
      result.warnings.forEach(key => {
        console.log(`     • ${key}`);
      });
    }
    
    if (result.present.length > 0) {
      console.log(`   ${colors.green}Configured variables: ${result.present.length}${colors.reset}`);
    }
    
    console.log('');
  });
  
  if (allValid) {
    console.log(`${colors.green}🎉 All environment files are valid!${colors.reset}`);
  } else {
    console.log(`${colors.red}⚠️  Some environment files are missing or incomplete.${colors.reset}`);
    console.log(`\n${colors.yellow}💡 To fix:${colors.reset}`);
    console.log(`   • Copy .env.example to .env in each service directory`);
    console.log(`   • Run: php artisan key:generate in each Laravel service`);
    console.log(`   • Configure database and API keys as needed`);
  }
  
  return allValid;
}

// Run the validation
validateAllEnvs().then(success => {
  process.exit(success ? 0 : 1);
});
