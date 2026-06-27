const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_PfJsZg49bUxT@ep-small-voice-a1o0n6xl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' });
pool.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog')").then(res => { console.log(res.rows); pool.end(); });
