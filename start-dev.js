const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const { Pool } = require('pg');

// Load environment variables from custom files
const envMapPath = path.resolve(process.cwd(), '.env.map');
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envSecretPath = path.resolve(process.cwd(), '.env.secret');

const mapEnv = fs.existsSync(envMapPath) ? dotenv.parse(fs.readFileSync(envMapPath)) : {};
const localEnv = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};
const secretEnv = fs.existsSync(envSecretPath) ? dotenv.parse(fs.readFileSync(envSecretPath)) : {};

async function startDev() {
    let useDeployedUrls = process.env.USE_DEPLOYED_URLS === 'true' || 
                          localEnv.USE_DEPLOYED_URLS === 'true' || 
                          secretEnv.USE_DEPLOYED_URLS === 'true' || 
                          mapEnv.USE_DEPLOYED_URLS === 'true';

    const dbUrl = process.env.DATABASE_URL || secretEnv.DATABASE_URL || localEnv.DATABASE_URL || mapEnv.DATABASE_URL;
    
    if (dbUrl) {
        const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
        try {
            const res = await pool.query("SELECT enabled FROM public.toggles WHERE name = 'enableDeployedUrls'");
            if (res.rows.length > 0) {
                useDeployedUrls = res.rows[0].enabled;
            }
        } catch (err) {
            console.error('🚀 [start-dev] Failed to fetch toggle from DB, falling back to .env:', err.message);
        } finally {
            await pool.end();
        }
    }

    let mergedEnv;
    if (useDeployedUrls) {
        console.log('🚀 DB Toggle (enableDeployedUrls) is ON: Loading custom environment variables, prioritizing .env.map (deployed URLs)');
        mergedEnv = {
            ...process.env,
            ...localEnv,
            ...secretEnv,
            ...mapEnv,
        };
    } else {
        console.log('🚀 DB Toggle (enableDeployedUrls) is OFF: Loading custom environment variables, prioritizing .env.local (localhost URLs)');
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
}

startDev();
