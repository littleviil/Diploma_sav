# Деплой React + Express + PostgreSQL

Проект теперь состоит из:

- React/Vite frontend в `src/`;
- Express backend в `server/`;
- PostgreSQL через переменную окружения `DATABASE_URL`;
- production-сервера `npm run start`, который отдает API `/api/*` и собранный frontend из `dist/`.

## Локальный запуск

1. Скопируйте `.env.example` в `.env`.
2. Укажите `DATABASE_URL` на свою PostgreSQL БД.
3. Запустите API:

```bash
npm run dev:api
```

4. В другом терминале запустите frontend:

```bash
npm run dev
```

Если PostgreSQL не указан, сервер стартует с временным in-memory fallback, чтобы интерфейс не падал.

## Render

В репозитории есть `render.yaml`. На Render можно создать Blueprint из GitHub-репозитория:

- web service: `npm install && npm run build`;
- start command: `npm run start`;
- health check: `/api/health`;
- PostgreSQL создается как `diplom-zkh-db`;
- `DATABASE_URL` подставляется из Postgres connection string.

## Railway

В репозитории есть `railway.json`.

1. Создайте Railway project из GitHub-репозитория.
2. Добавьте PostgreSQL service.
3. В переменных web service задайте:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

4. Railway должен использовать:

```text
Build: npm install && npm run build
Start: npm run start
```

## Проверка

После деплоя откройте:

```text
https://ваш-домен/api/health
```

Ожидаемый ответ:

```json
{ "ok": true, "database": "postgres" }
```
