const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from custom files
const envMapPath = path.resolve(process.cwd(), '.env.map');
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envSecretPath = path.resolve(process.cwd(), '.env.secret');

const mapEnv = fs.existsSync(envMapPath) ? dotenv.parse(fs.readFileSync(envMapPath)) : {};
const localEnv = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};
const secretEnv = fs.existsSync(envSecretPath) ? dotenv.parse(fs.readFileSync(envSecretPath)) : {};

// Determine the toggle state from any of the available sources
const useDeployedUrls = 
    process.env.USE_DEPLOYED_URLS === 'true' || 
    localEnv.USE_DEPLOYED_URLS === 'true' || 
    secretEnv.USE_DEPLOYED_URLS === 'true' || 
    mapEnv.USE_DEPLOYED_URLS === 'true';

// Merge with process.env
let mergedEnv;

if (useDeployedUrls) {
    console.log('🚀 USE_DEPLOYED_URLS toggle is ON: Loading custom environment variables for build, prioritizing .env.map (deployed URLs)');
    mergedEnv = {
        ...process.env,
        ...localEnv,
        ...secretEnv,
        ...mapEnv,
    };
} else {
    console.log('🚀 USE_DEPLOYED_URLS toggle is OFF: Loading custom environment variables for build, prioritizing .env.local (localhost URLs)');
    mergedEnv = {
        ...process.env,
        ...mapEnv,
        ...secretEnv,
        ...localEnv,
    };
}

// Start the Next.js build
const nextProcess = spawn('npx', ['next', 'build'], {
    stdio: 'inherit',
    env: mergedEnv,
    shell: true
});

nextProcess.on('close', (code) => {
    process.exit(code);
});
