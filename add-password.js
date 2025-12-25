const { Client } = require('pg');

async function addPasswordColumn() {
  const client = new Client({
    connectionString: process.argv[2],
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected');

    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)');
    console.log('✅ password 컬럼 추가 완료');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addPasswordColumn();
