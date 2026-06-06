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

const port = mergedEnv.APP_PORT || '3000';
const nextProcess = spawn('npx', ['next', 'dev', '-p', port], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: mergedEnv,
    shell: true
});

const sanitizeLog = (data) => {
    let str = data.toString();
    // Hide large tokens like code=... in OAuth callbacks
    str = str.replace(/([?&](?:code|token|access_token|state|session_state)=)[a-zA-Z0-9\-_.~%]+/g, '$1<hidden>');
    return str;
};

nextProcess.stdout.on('data', (data) => {
    process.stdout.write(sanitizeLog(data));
});

nextProcess.stderr.on('data', (data) => {
    process.stderr.write(sanitizeLog(data));
});

nextProcess.on('close', (code) => {
    process.exit(code);
});
