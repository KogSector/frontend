const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from custom files
const envMapPath = path.resolve(process.cwd(), '.env.map');
const envSecretPath = path.resolve(process.cwd(), '.env.secret');

const mapEnv = fs.existsSync(envMapPath) ? dotenv.parse(fs.readFileSync(envMapPath)) : {};
const secretEnv = fs.existsSync(envSecretPath) ? dotenv.parse(fs.readFileSync(envSecretPath)) : {};

// Merge with process.env
const mergedEnv = {
    ...process.env,
    ...mapEnv,
    ...secretEnv,
};

console.log('🚀 Loading custom environment variables from .env.map and .env.secret');

// Start the Next.js development server
const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
    stdio: 'inherit',
    env: mergedEnv,
    shell: true
});

nextProcess.on('close', (code) => {
    process.exit(code);
});
