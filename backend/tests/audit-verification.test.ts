import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../src/middleware/auth';
import { prisma } from '../src/prisma';
import http from 'http';

// Helper to make local HTTP requests to the Express app
function request(
  server: http.Server,
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const addr = server.address() as any;
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const payload = body ? JSON.stringify(body) : undefined;
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port: addr.port,
        method,
        path,
        headers: reqHeaders,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsed: any = rawData;
          try {
            parsed = JSON.parse(rawData);
          } catch (_) {}
          resolve({ status: res.statusCode || 500, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

test('Comprehensive Full-Stack Security and API Audit Suite', async (t) => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  t.after(() => {
    server.close();
  });

  await t.test('1. Security: Public registration forbids self-assigned admin or agent role', async () => {
    const res = await request(server, 'POST', '/api/v1/auth/register', {
      name: 'Malicious User',
      email: 'hacker@example.com',
      password: 'password123',
      role: 'admin',
    });

    assert.equal(res.status, 403, 'Should reject registration with admin role with 403');
    assert.match(res.body.error, /Administrative or Agent accounts must be created by an Administrator/i);
  });

  await t.test('2. Security: Registration response never leaks plaintext OTP code', async () => {
    const testEmail = `test_otp_${Date.now()}@example.com`;
    const res = await request(server, 'POST', '/api/v1/auth/register', {
      name: 'Safe User',
      email: testEmail,
      password: 'StrongPassword123!',
      role: 'seeker',
    });

    if (res.status === 201) {
      assert.equal(res.body.code, undefined, 'Registration must NEVER expose OTP code in response');
      assert.equal(res.body.requiresEmailVerification, true);
    }
  });

  await t.test('3. Security: Password reset never leaks OTP code and prevents account enumeration', async () => {
    const res = await request(server, 'POST', '/api/v1/auth/forgot-password', {
      email: 'nonexistent_user_999999@example.com',
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, undefined, 'Forgot password must NEVER expose reset OTP code');
    assert.match(
      res.body.message,
      /If an account exists with that email/i,
      'Response must be generic to prevent account enumeration'
    );
  });

  await t.test('4. Security: Hardcoded OTP bypass (123456) is rejected', async () => {
    const fakeToken = jwt.sign(
      { id: 'usr-fake-test-id', email: 'test@example.com', role: 'seeker', name: 'Tester' },
      getJwtSecret(),
      { expiresIn: '1h' }
    );

    const res = await request(
      server,
      'POST',
      '/api/v1/auth/verify-phone-otp',
      { code: '123456' },
      { Authorization: `Bearer ${fakeToken}` }
    );

    assert.notEqual(res.status, 200, 'Hardcoded 123456 bypass must not succeed');
  });

  await t.test('5. Auth: AuthenticateToken accepts token from Cookie as well as Header', async () => {
    const testUser = { id: 'usr-cookie-test', email: 'cookie@example.com', role: 'seeker', name: 'Cookie User' };
    const validToken = jwt.sign(testUser, getJwtSecret(), { expiresIn: '1h' });

    // Request using Cookie instead of Authorization header
    const res = await request(server, 'GET', '/api/v1/profile', null, {
      Cookie: `delala_token=${validToken}`,
    });

    // If user is not found in database, status is 404, not 401 (meaning auth passed!)
    assert.notEqual(res.status, 401, 'AuthenticateToken must accept valid cookie without 401');
  });

  await t.test('6. Routing: Cart and Order endpoints respond correctly', async () => {
    const testUser = { id: 'usr-cart-tester', email: 'cart@example.com', role: 'seeker', name: 'Cart Tester' };
    const validToken = jwt.sign(testUser, getJwtSecret(), { expiresIn: '1h' });

    // GET /api/v1/cart
    const cartRes = await request(server, 'GET', '/api/v1/cart', null, {
      Authorization: `Bearer ${validToken}`,
    });
    assert.equal(cartRes.status, 200);
    assert.ok(Array.isArray(cartRes.body.items));

    // GET /api/v1/orders
    const ordersRes = await request(server, 'GET', '/api/v1/orders', null, {
      Authorization: `Bearer ${validToken}`,
    });
    assert.equal(ordersRes.status, 200);
    assert.ok(Array.isArray(ordersRes.body.orders));

    // GET /api/v1/services/book
    const bookRes = await request(server, 'GET', '/api/v1/services/book', null, {
      Authorization: `Bearer ${validToken}`,
    });
    assert.equal(bookRes.status, 200);
    assert.ok(Array.isArray(bookRes.body.bookings));
  });

  await t.test('7. Business Logic: Unauthorized status updates on rentals and sales are rejected', async () => {
    const seekerToken = jwt.sign(
      { id: 'usr-unauthorized-seeker', email: 'seeker@example.com', role: 'seeker', name: 'Seeker' },
      getJwtSecret(),
      { expiresIn: '1h' }
    );

    // Non-existent or unauthorized rental request update
    const rentalRes = await request(
      server,
      'PATCH',
      '/api/v1/rentals/fake-rental-req-id/status',
      { status: 'ACCEPTED' },
      { Authorization: `Bearer ${seekerToken}` }
    );
    assert.equal(rentalRes.status, 400);

    // Non-existent or unauthorized sale request update
    const saleRes = await request(
      server,
      'PATCH',
      '/api/v1/sales/fake-sale-req-id/status',
      { status: 'ACCEPTED' },
      { Authorization: `Bearer ${seekerToken}` }
    );
    assert.equal(saleRes.status, 400);
  });

  await t.test('8. Admin & Agent Routing: Non-privileged users blocked from admin agents endpoint', async () => {
    const seekerToken = jwt.sign(
      { id: 'usr-regular-seeker', email: 'regular@example.com', role: 'seeker', name: 'Regular' },
      getJwtSecret(),
      { expiresIn: '1h' }
    );

    const adminAgentsRes = await request(
      server,
      'GET',
      '/api/v1/admin/agents',
      null,
      { Authorization: `Bearer ${seekerToken}` }
    );
    assert.equal(adminAgentsRes.status, 403, 'Seekers must be blocked from admin agents management');
  });

  await t.test('9. Health: Health check endpoint is active', async () => {
    const res = await request(server, 'GET', '/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  await t.test('10. Security: Google OAuth rejects requests without a valid Google ID token', async () => {
    // Missing token with arbitrary email must be strictly rejected (no bypass)
    const res = await request(server, 'POST', '/api/v1/auth/google', {
      email: 'admin@ethiopianhouserental.et',
      name: 'Impersonated Admin',
      role: 'admin',
    });
    assert.equal(res.status, 400, 'Must require a valid Google ID token');
    assert.match(res.body.error, /Google ID token.*required/i);
  });

  await t.test('11. Security: Google OAuth rejects forged or invalid Google token', async () => {
    const res = await request(server, 'POST', '/api/v1/auth/google', {
      idToken: 'forged_google_jwt_token_12345',
      role: 'seeker',
    });
    assert.equal(res.status, 401, 'Forged or invalid token must return 401');
    assert.match(res.body.error, /Invalid.*token/i);
  });

  await t.test('12. Security: OTP Resend enforces cooldown rate limit', async () => {
    const testEmail = `cooldown_test_${Date.now()}@example.com`;

    // First request should succeed
    const res1 = await request(server, 'POST', '/api/v1/auth/forgot-password', {
      email: testEmail,
    });
    assert.equal(res1.status, 200);

    // Immediate second request within 60s should be blocked with 429
    const res2 = await request(server, 'POST', '/api/v1/auth/forgot-password', {
      email: testEmail,
    });
    assert.equal(res2.status, 429, 'Immediate duplicate OTP request must be rate-limited with 429');
    assert.match(res2.body.error, /Please wait.*seconds before requesting another/i);
  });

  await t.test('13. Security: Profile update never leaks passwordHash or verification codes', async () => {
    // 13a. Non-existent user ID returns 404 cleanly without 500 or crash
    const fakeToken = jwt.sign(
      { id: 'usr-nonexistent-id-999', email: 'nobody@example.com', role: 'seeker', name: 'Nobody' },
      getJwtSecret(),
      { expiresIn: '1h' }
    );
    const res404 = await request(
      server,
      'PATCH',
      '/api/v1/profile',
      { name: 'Updated Name' },
      { Authorization: `Bearer ${fakeToken}` }
    );
    assert.equal(res404.status, 404, 'Unknown user must return 404');

    // 13b. Register an actual user and verify PATCH profile sanitizes secrets
    const testEmail = `patch_leak_test_${Date.now()}@example.com`;
    const regRes = await request(server, 'POST', '/api/v1/auth/register', {
      name: 'Sanitize Tester',
      email: testEmail,
      password: 'SafePassword123!',
      role: 'seeker',
    });

    if (regRes.status === 201) {
      // Find created user ID to sign token
      const user = await prisma.user.findUnique({ where: { email: testEmail } });
      if (user) {
        const userToken = jwt.sign(
          { id: user.id, email: user.email, role: user.role, name: user.name },
          getJwtSecret(),
          { expiresIn: '1h' }
        );

        const patchRes = await request(
          server,
          'PATCH',
          '/api/v1/profile',
          { name: 'Sanitized Name', address: 'Kazanchis' },
          { Authorization: `Bearer ${userToken}` }
        );

        assert.equal(patchRes.status, 200);
        assert.ok(patchRes.body.user);
        assert.equal(patchRes.body.user.name, 'Sanitized Name');
        assert.equal(patchRes.body.user.passwordHash, undefined, 'passwordHash must never be exposed');
        assert.equal(patchRes.body.user.emailVerificationCode, undefined, 'emailVerificationCode must never be exposed');
        assert.equal(patchRes.body.user.phoneVerificationCode, undefined, 'phoneVerificationCode must never be exposed');
      }
    }
  });

  await t.test('14. Orders: Requesting a non-existent order returns 404 instead of a mock placeholder', async () => {
    const testUser = { id: 'usr-order-404-test', email: 'order404@example.com', role: 'seeker', name: 'Order 404 Tester' };
    const validToken = jwt.sign(testUser, getJwtSecret(), { expiresIn: '1h' });

    const res = await request(
      server,
      'GET',
      '/api/v1/orders/non-existent-order-id-99999',
      null,
      { Authorization: `Bearer ${validToken}` }
    );

    assert.equal(res.status, 404, 'Non-existent order must return 404');
    assert.match(res.body.error, /Order not found/i);
  });
});

