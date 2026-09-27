import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { generateToken, requireAdmin, type AuthUser } from '../lib/auth-middleware';
import { GET as dashboardGet } from '../app/api/admin/dashboard/route';
import { GET as statsGet } from '../app/api/admin/stats/route';
import { GET as usersGet, POST as usersPost } from '../app/api/admin/users/route';
import { GET as crawlGet } from '../app/api/cron/crawl/route';
import { GET as curateGet } from '../app/api/cron/curate/route';

async function main() {
  const url = 'http://localhost/api/admin/dashboard';
  const noAuth = new NextRequest(url);
  assert.equal(requireAdmin(noAuth).error?.status, 401);
  assert.equal((await dashboardGet(noAuth)).status, 401);
  assert.equal((await statsGet(noAuth)).status, 401);
  assert.equal((await usersGet(noAuth)).status, 401);
  assert.equal((await usersPost(new NextRequest(url, { method: 'POST' }))).status, 401);
  if (!process.env.CRON_SECRET) {
    const fakeCronRequest = new Request('http://localhost/api/cron/crawl', {
      headers: { Authorization: 'Bearer undefined' },
    });
    assert.equal((await crawlGet(fakeCronRequest)).status, 401);
    assert.equal((await curateGet(fakeCronRequest)).status, 401);
  }

  const base: AuthUser = {
    id: 'synthetic-user', email: 'synthetic@example.invalid', department_id: 'test',
    department_name: 'test', role: 'user', status: 'approved',
  };
  if (!process.env.JWT_SECRET) {
    assert.throws(() => generateToken(base), /JWT_SECRET is not configured/);
    process.stdout.write('admin_auth_fail_closed=passed\n');
    return;
  }
  const userToken = generateToken(base);
  assert.equal(requireAdmin(new NextRequest(url, {
    headers: { Authorization: `Bearer ${userToken}` },
  })).error?.status, 403);

  const adminToken = generateToken({ ...base, role: 'admin' });
  assert.equal(requireAdmin(new NextRequest(url, {
    headers: { Authorization: `Bearer ${adminToken}` },
  })).user?.id, base.id);
  process.stdout.write('admin_auth_smoke=passed\n');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
