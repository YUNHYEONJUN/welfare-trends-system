const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.argv[2];

async function applySchema() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // 순서가 중요합니다!
    const schemas = [
      'lib/db-schema.sql',        // 먼저 contents 테이블 생성
      'lib/curation-schema.sql',  // 큐레이션 테이블
      'lib/auth-schema.sql',      // users 테이블 (contents 참조)
      'lib/add_password_field.sql' // password 필드 추가
    ];

    for (const schemaFile of schemas) {
      const filePath = path.join(__dirname, schemaFile);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping ${schemaFile} (file not found)`);
        continue;
      }

      console.log(`\n📝 Applying ${schemaFile}...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await client.query(sql);
        console.log(`✅ ${schemaFile} applied successfully`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`⚠️  ${schemaFile} - objects already exist, skipping`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n🎉 All schemas applied successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySchema();
