const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.argv[2];
const email = process.argv[3] || 'admin@welfare-trends.com';
const password = process.argv[4] || 'admin123!@#';

async function createAdmin() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 관리자 계정 생성
    const result = await client.query(`
      INSERT INTO users (email, password, department_id, department_name, role, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE
      SET password = EXCLUDED.password,
          role = EXCLUDED.role,
          status = EXCLUDED.status
      RETURNING id, email, role, status;
    `, [email, hashedPassword, 'admin', '관리자', 'admin', 'approved']);

    console.log('\n🎉 관리자 계정 생성 완료!');
    console.log('📧 Email:', result.rows[0].email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', result.rows[0].role);
    console.log('✅ Status:', result.rows[0].status);
    console.log('\n⚠️  보안을 위해 첫 로그인 후 비밀번호를 변경하세요!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createAdmin();
