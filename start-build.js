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

async function startBuild() {
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
            console.error('🚀 [start-build] Failed to fetch toggle from DB, falling back to .env:', err.message);
        } finally {
            await pool.end();
        }
    }

    let mergedEnv;
    if (useDeployedUrls) {
        console.log('🚀 DB Toggle (enableDeployedUrls) is ON: Loading custom environment variables for build, prioritizing .env.map (deployed URLs)');
        mergedEnv = {
            ...process.env,
            ...localEnv,
            ...secretEnv,
            ...mapEnv,
        };
    } else {
        console.log('🚀 DB Toggle (enableDeployedUrls) is OFF: Loading custom environment variables for build, prioritizing .env.local (localhost URLs)');
        mergedEnv = {
            ...process.env,
            ...mapEnv,
            ...secretEnv,
            ...localEnv,
        };
    }

    const nextProcess = spawn('npx', ['next', 'build'], {
        stdio: 'inherit',
        env: mergedEnv,
        shell: true
    });

    nextProcess.on('close', (code) => {
        process.exit(code);
    });
}

startBuild();
