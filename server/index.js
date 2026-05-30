import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hasDatabase, initDatabase, pool } from './db.js';
import { getStore, replaceStore, seedIfEmpty } from './storeRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const port = Number(process.env.PORT ?? 3001);

const app = express();

app.use(express.json({ limit: '2mb' }));

app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }

  next();
});

app.get('/api/health', async (_request, response) => {
  const database = hasDatabase();

  if (!database) {
    response.json({ ok: true, database: 'memory-fallback' });
    return;
  }

  try {
    await pool.query('SELECT 1');
    response.json({ ok: true, database: 'postgres' });
  } catch (error) {
    response.status(503).json({ ok: false, database: 'postgres', message: error.message });
  }
});

app.get('/api/store', async (_request, response, next) => {
  try {
    response.json(await getStore(pool));
  } catch (error) {
    next(error);
  }
});

app.put('/api/store', async (request, response, next) => {
  try {
    response.json(await replaceStore(pool, request.body));
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (request, response, next) => {
  try {
    const { email, password, role } = request.body ?? {};
    const store = await getStore(pool);
    const user = store.users.find(
      (item) => item.email === String(email ?? '').trim() && item.password === password && item.role === role,
    );

    if (!user) {
      response.status(401).json({ ok: false, message: 'Проверьте почту, пароль и выбранную роль.' });
      return;
    }

    response.json({ ok: true, user });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(distDir));

app.get(/.*/, (_request, response) => {
  response.sendFile(path.join(distDir, 'index.html'));
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ ok: false, message: 'Ошибка сервера' });
});

async function start() {
  await initDatabase();
  await seedIfEmpty(pool);

  app.listen(port, () => {
    const storage = hasDatabase() ? 'PostgreSQL' : 'in-memory fallback';
    console.log(`Server started on http://127.0.0.1:${port} (${storage})`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
