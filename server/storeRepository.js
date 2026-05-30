import { createDemoStore } from './demoData.js';

const memoryStore = createDemoStore();

const toNumber = (value) => (value == null ? value : Number(value));
const toDateString = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
};

const normalizeStore = (store) => ({
  users: Array.isArray(store?.users) ? store.users : [],
  accounts: Array.isArray(store?.accounts) ? store.accounts : [],
  receipts: Array.isArray(store?.receipts) ? store.receipts : [],
  payments: Array.isArray(store?.payments) ? store.payments : [],
  organizations: Array.isArray(store?.organizations) ? store.organizations : [],
});

export async function seedIfEmpty(pool) {
  if (!pool) {
    return;
  }

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  if (rows[0]?.count > 0) {
    return;
  }

  await replaceStore(pool, createDemoStore());
}

export async function getStore(pool) {
  if (!pool) {
    return memoryStore;
  }

  const [users, accounts, receipts, payments, organizations] = await Promise.all([
    pool.query(`
      SELECT id, role, name, email, password, phone, account_id, org_id, login_name, employee_role, position
      FROM users
      ORDER BY created_at, id
    `),
    pool.query(`
      SELECT id, number, owner_name, address
      FROM accounts
      ORDER BY created_at, id
    `),
    pool.query(`
      SELECT id, account_id, period, service, amount, status, due_date, paid_at, method
      FROM receipts
      ORDER BY due_date NULLS LAST, id
    `),
    pool.query(`
      SELECT id, receipt_id, method, paid_at, amount
      FROM payments
      ORDER BY paid_at, id
    `),
    pool.query(`
      SELECT id, data
      FROM organizations
      ORDER BY updated_at, id
    `),
  ]);

  return {
    users: users.rows.map((row) => ({
      id: row.id,
      role: row.role,
      name: row.name,
      email: row.email,
      password: row.password,
      phone: row.phone ?? '',
      accountId: row.account_id ?? undefined,
      orgId: row.org_id ?? undefined,
      loginName: row.login_name ?? undefined,
      employeeRole: row.employee_role ?? undefined,
      position: row.position ?? undefined,
    })),
    accounts: accounts.rows.map((row) => ({
      id: row.id,
      number: row.number,
      ownerName: row.owner_name,
      address: row.address,
    })),
    receipts: receipts.rows.map((row) => ({
      id: row.id,
      accountId: row.account_id,
      period: row.period,
      service: row.service,
      amount: toNumber(row.amount),
      status: row.status,
      dueDate: toDateString(row.due_date),
      paidAt: toDateString(row.paid_at),
      method: row.method,
    })),
    payments: payments.rows.map((row) => ({
      id: row.id,
      receiptId: row.receipt_id,
      method: row.method,
      paidAt: toDateString(row.paid_at),
      amount: toNumber(row.amount),
    })),
    organizations: organizations.rows.map((row) => row.data),
  };
}

export async function replaceStore(pool, incomingStore) {
  const store = normalizeStore(incomingStore);

  if (!pool) {
    Object.assign(memoryStore, structuredClone(store));
    return memoryStore;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM payments');
    await client.query('DELETE FROM receipts');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM accounts');
    await client.query('DELETE FROM organizations');

    for (const account of store.accounts) {
      await client.query(
        `
          INSERT INTO accounts (id, number, owner_name, address)
          VALUES ($1, $2, $3, $4)
        `,
        [account.id, account.number, account.ownerName, account.address],
      );
    }

    for (const user of store.users) {
      await client.query(
        `
          INSERT INTO users (
            id, role, name, email, password, phone, account_id, org_id, login_name, employee_role, position
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
        [
          user.id,
          user.role,
          user.name,
          user.email,
          user.password,
          user.phone ?? null,
          user.accountId ?? null,
          user.orgId ?? null,
          user.loginName ?? null,
          user.employeeRole ?? null,
          user.position ?? null,
        ],
      );
    }

    for (const receipt of store.receipts) {
      await client.query(
        `
          INSERT INTO receipts (id, account_id, period, service, amount, status, due_date, paid_at, method)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          receipt.id,
          receipt.accountId,
          receipt.period,
          receipt.service,
          receipt.amount,
          receipt.status,
          receipt.dueDate ?? null,
          receipt.paidAt ?? null,
          receipt.method ?? null,
        ],
      );
    }

    for (const payment of store.payments) {
      await client.query(
        `
          INSERT INTO payments (id, receipt_id, method, paid_at, amount)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [payment.id, payment.receiptId, payment.method, payment.paidAt, payment.amount],
      );
    }

    for (const organization of store.organizations) {
      await client.query(
        `
          INSERT INTO organizations (id, data)
          VALUES ($1, $2::jsonb)
        `,
        [organization.id, JSON.stringify(organization)],
      );
    }

    await client.query('COMMIT');
    return store;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
