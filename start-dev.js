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
    console.log('🚀 USE_DEPLOYED_URLS toggle is ON: Loading custom environment variables, prioritizing .env.map (deployed URLs)');
    mergedEnv = {
        ...process.env,
        ...localEnv,
        ...secretEnv,
        ...mapEnv,
    };
} else {
    console.log('🚀 USE_DEPLOYED_URLS toggle is OFF: Loading custom environment variables, prioritizing .env.local (localhost URLs)');
    mergedEnv = {
        ...process.env,
        ...mapEnv,
        ...secretEnv,
        ...localEnv,
    };
}

const port = mergedEnv.FRONTEND_PORT || '3000';
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

// Ensure child process is killed when parent exits
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
    process.on(signal, () => {
        if (!nextProcess.killed) {
            nextProcess.kill(signal);
        }
        process.exit();
    });
});
