import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../src/middleware/auth';
import { prisma } from '../src/prisma';
import http from 'http';

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

test('Agent Region/City-Based Access Control Test Suite', async (t) => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const testSuffix = Date.now();
  let adminUser: any;
  let debreBirhanAgent: any;
  let addisProperty: any;
  let debreBirhanProperty: any;
  let addisDoc: any;

  let adminToken: string;
  let agentToken: string;

  await t.test('Setup: Create test users and properties across distinct cities', async () => {
    // 1. Create Admin
    adminUser = await prisma.user.create({
      data: {
        name: `Territory Admin ${testSuffix}`,
        email: `admin_${testSuffix}@delala.et`,
        passwordHash: 'hash',
        role: 'admin',
        city: 'Addis Ababa',
        assignedArea: 'Addis Ababa',
        active: true,
      },
    });
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'admin', name: adminUser.name },
      getJwtSecret()
    );

    // 2. Create Agent assigned specifically to Debre Birhan
    debreBirhanAgent = await prisma.user.create({
      data: {
        name: `Serawit DebreBirhan ${testSuffix}`,
        email: `agent_db_${testSuffix}@delala.et`,
        passwordHash: 'hash',
        role: 'agent',
        city: 'Debre Birhan',
        assignedArea: 'Debre Birhan',
        active: true,
      },
    });
    agentToken = jwt.sign(
      { id: debreBirhanAgent.id, email: debreBirhanAgent.email, role: 'agent', name: debreBirhanAgent.name },
      getJwtSecret()
    );

    // 3. Create property in Addis Ababa (outside agent territory)
    addisProperty = await prisma.property.create({
      data: {
        providerId: adminUser.id,
        providerName: 'Addis Landlord',
        providerPhone: '+251911000001',
        title: `Bole Luxury Flat ${testSuffix}`,
        description: 'Prime apartment in Bole Addis Ababa',
        propertyType: 'Apartment',
        price: 35000,
        rooms: 2,
        bathrooms: 2,
        city: 'Addis Ababa',
        area: 'Bole',
        neighborhood: 'Atlas',
        listingStatus: 'active',
        availability: true,
      },
    });

    // 4. Create property in Debre Birhan (inside agent territory)
    debreBirhanProperty = await prisma.property.create({
      data: {
        providerId: adminUser.id,
        providerName: 'Debre Birhan Landlord',
        providerPhone: '+251911000002',
        title: `Debre Birhan Cozy Villa ${testSuffix}`,
        description: 'Modern house in Debre Birhan town',
        propertyType: 'Villa',
        price: 18000,
        rooms: 3,
        bathrooms: 2,
        city: 'Debre Birhan',
        area: 'Tebasi',
        neighborhood: 'Kebele 04',
        listingStatus: 'active',
        availability: true,
      },
    });

    // 5. Create a property document in Addis Ababa
    addisDoc = await prisma.propertyDocument.create({
      data: {
        propertyId: addisProperty.id,
        ownerId: adminUser.id,
        docType: 'TITLE_DEED',
        docUrl: 'https://example.com/addis-deed.pdf',
        status: 'UNDER_REVIEW',
      },
    });

    assert.ok(adminToken);
    assert.ok(agentToken);
    assert.ok(addisProperty.id);
    assert.ok(debreBirhanProperty.id);
  });

  await t.test('Agent can only list properties belonging to assigned city', async () => {
    const res = await request(server, 'GET', '/api/v1/agent/properties', undefined, {
      Authorization: `Bearer ${agentToken}`,
    });

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    const foundAddis = res.body.find((p: any) => p.id === addisProperty.id);
    const foundDB = res.body.find((p: any) => p.id === debreBirhanProperty.id);

    assert.equal(foundAddis, undefined, 'Agent MUST NOT see Addis Ababa property');
    assert.ok(foundDB, 'Agent MUST see Debre Birhan property');
  });

  await t.test('Agent viewing single property outside assigned area returns 403 Forbidden', async () => {
    const res = await request(server, 'GET', `/api/v1/properties/${addisProperty.id}`, undefined, {
      Authorization: `Bearer ${agentToken}`,
    });

    assert.equal(res.status, 403, 'Access to Addis property by Debre Birhan agent must be 403 Forbidden');
    assert.match(res.body.error, /authorized/i);
  });

  await t.test('Agent viewing single property in assigned area returns 200 OK', async () => {
    const res = await request(server, 'GET', `/api/v1/properties/${debreBirhanProperty.id}`, undefined, {
      Authorization: `Bearer ${agentToken}`,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.id, debreBirhanProperty.id);
  });

  await t.test('Agent creating property outside assigned city returns 403 Forbidden', async () => {
    const res = await request(
      server,
      'POST',
      '/api/v1/agent/properties',
      {
        title: 'Hawassa Lakeside Studio',
        price: 25000,
        city: 'Hawassa',
        area: 'Lakeside',
      },
      {
        Authorization: `Bearer ${agentToken}`,
      }
    );

    assert.equal(res.status, 403, 'Must reject creating property in Hawassa for Debre Birhan agent');
    assert.match(res.body.error, /assigned territory/i);
  });

  await t.test('Agent creating property within assigned city returns 201 Created', async () => {
    const res = await request(
      server,
      'POST',
      '/api/v1/agent/properties',
      {
        title: `Debre Birhan New Studio ${testSuffix}`,
        price: 12000,
        city: 'Debre Birhan',
        area: 'Tebasi',
      },
      {
        Authorization: `Bearer ${agentToken}`,
      }
    );

    assert.equal(res.status, 201);
    assert.equal(res.body.city, 'Debre Birhan');

    // Cleanup created property
    if (res.body?.id) {
      await prisma.property.delete({ where: { id: res.body.id } }).catch(() => {});
    }
  });

  await t.test('Agent modifying property outside assigned city returns 403 Forbidden', async () => {
    const res = await request(
      server,
      'PATCH',
      `/api/v1/properties/${addisProperty.id}`,
      {
        price: 99999,
      },
      {
        Authorization: `Bearer ${agentToken}`,
      }
    );

    assert.equal(res.status, 403, 'Must reject editing Addis property by Debre Birhan agent');
  });

  await t.test('Agent deleting property outside assigned city returns 403 Forbidden', async () => {
    const res = await request(
      server,
      'DELETE',
      `/api/v1/properties/${addisProperty.id}`,
      undefined,
      {
        Authorization: `Bearer ${agentToken}`,
      }
    );

    assert.equal(res.status, 403, 'Must reject deleting Addis property by Debre Birhan agent');
  });

  await t.test('Agent reviewing document outside assigned territory returns 403 Forbidden', async () => {
    const res = await request(
      server,
      'PATCH',
      `/api/v1/verification/property-license/${addisDoc.id}/review`,
      {
        status: 'VERIFIED',
      },
      {
        Authorization: `Bearer ${agentToken}`,
      }
    );

    assert.equal(res.status, 403, 'Must reject reviewing document outside assigned territory');
    assert.match(res.body.error, /assigned territory/i);
  });

  await t.test('Admin retains nationwide access to all cities and properties', async () => {
    const resAddis = await request(server, 'GET', `/api/v1/properties/${addisProperty.id}`, undefined, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(resAddis.status, 200, 'Admin can view Addis property');

    const resDB = await request(server, 'GET', `/api/v1/properties/${debreBirhanProperty.id}`, undefined, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(resDB.status, 200, 'Admin can view Debre Birhan property');
  });

  await t.test('Admin can assign or change agent territory to Adama and scope immediately updates', async () => {
    // Admin changes agent's assigned area to Adama
    const updateRes = await request(
      server,
      'PUT',
      `/api/v1/admin/agents/${debreBirhanAgent.id}`,
      {
        assignedArea: 'Adama',
        city: 'Adama',
      },
      {
        Authorization: `Bearer ${adminToken}`,
      }
    );

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.assignedArea, 'Adama');

    // Agent now queries assigned properties - Debre Birhan should no longer appear
    const propRes = await request(server, 'GET', '/api/v1/agent/properties', undefined, {
      Authorization: `Bearer ${agentToken}`,
    });

    assert.equal(propRes.status, 200);
    const foundDB = propRes.body.find((p: any) => p.id === debreBirhanProperty.id);
    assert.equal(foundDB, undefined, 'Debre Birhan property must not be visible after reassignment to Adama');

    // Agent can now create in Adama
    const createAdamaRes = await request(
      server,
      'POST',
      '/api/v1/agent/properties',
      {
        title: `Adama Commercial Space ${testSuffix}`,
        price: 40000,
        city: 'Adama',
        area: 'Posta Bet',
      },
      {
        Authorization: `Bearer ${agentToken}`,
      }
    );

    assert.equal(createAdamaRes.status, 201, 'Agent can now create property in new assigned area Adama');

    if (createAdamaRes.body?.id) {
      await prisma.property.delete({ where: { id: createAdamaRes.body.id } }).catch(() => {});
    }
  });

  await t.test('Teardown: Clean up test records', async () => {
    if (addisDoc?.id) await prisma.propertyDocument.delete({ where: { id: addisDoc.id } }).catch(() => {});
    if (addisProperty?.id) await prisma.property.delete({ where: { id: addisProperty.id } }).catch(() => {});
    if (debreBirhanProperty?.id) await prisma.property.delete({ where: { id: debreBirhanProperty.id } }).catch(() => {});
    if (debreBirhanAgent?.id) await prisma.user.delete({ where: { id: debreBirhanAgent.id } }).catch(() => {});
    if (adminUser?.id) await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
    server.close();
  });
});
