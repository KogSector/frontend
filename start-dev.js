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

console.log('🚀 Loading custom environment variables from .env');

const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
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
