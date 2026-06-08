const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from custom files
const envMapPath = path.resolve(process.cwd(), '../.env');
const envSecretPath = path.resolve(process.cwd(), '../.env.secret');

const mapEnv = fs.existsSync(envMapPath) ? dotenv.parse(fs.readFileSync(envMapPath)) : {};
const secretEnv = fs.existsSync(envSecretPath) ? dotenv.parse(fs.readFileSync(envSecretPath)) : {};

// Merge with process.env
const mergedEnv = {
    ...process.env,
    ...mapEnv,
    ...secretEnv,
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
