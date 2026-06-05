const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from custom files
const envPath = path.resolve(process.cwd(), '.env');

const envVars = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};

// Merge with process.env
const mergedEnv = {
    ...process.env,
    ...envVars,
};

console.log('🚀 Loading custom environment variables for build...');

// Start the Next.js build
const nextProcess = spawn('npx', ['next', 'build'], {
    stdio: 'inherit',
    env: mergedEnv,
    shell: true
});

nextProcess.on('close', (code) => {
    process.exit(code);
});
