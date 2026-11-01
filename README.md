# kvartal-api — навчальний репозиторій кейса C15

«Квартал» — сервіс, який формує податкову звітність для ФОП і подає декларації через державне API «ДокатAPI». Бекенд на TypeScript, Node, Fastify, Drizzle і Postgres. Команда використовує Claude Code для роботи з багами з клієнтських звернень.

## Гілки

Репозиторій відтворює кейс C15 (M2T3, теорії 1 і 2) за змістом. Кейс вигаданий: усі ФОП несправжні, а ДокатAPI тут — локальна заглушка.

| Гілка | Що в ній |
| --- | --- |
| `main` | Початкова конфігурація Claude Code з Theory 1 |
| `theory-2` | Цільова конфігурація з Theory 2 |

Сценарії S3, S4 і S6 локально не відтворюються: тут немає хелпдеска, приватного реєстру й Slack.

## Цільова конфігурація

Гілка містить цільовий стан із Theory 2. `.claude/settings.json` дослівно збігається з розділом «Що дала конфігурація». Особисті налаштування не можуть жити в репозиторії, тому їхній приклад лежить у `docs/personal-settings.example.json`. Кожен розробник переносить їх у `~/.claude/settings.json`, а токен реєстру зі `~/.npmrc` у змінну `NPM_TOKEN`. У `~/.npmrc` лишається посилання:

```
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

| Крок | Зміна | Де | Сценарій |
| --- | --- | --- | --- |
| 1 | Вузькі allow замість `Bash(npm run *)` | `.claude/settings.json` | S5 |
| 2 | Sandbox: `Read(./.env)` діє і на запущені процеси | `.claude/settings.json` | S2 |
| 2 | `GITHUB_TOKEN` у `credentials` із режимом `deny` | `.claude/settings.json` | S2, S3 |
| 2 | `NPM_TOKEN` із режимом `mask`, `tlsTerminate` | особисті налаштування | S3, S4 |
| 3 | `allowedDomains`, `allowUnsandboxedCommands: false` | `.claude/settings.json` | S3 |
| 3 | `strictAllowlist` | особисті налаштування | S3 |
| 4 | `ask` на `npm run db:reset` і надсилання в Slack | `.claude/settings.json` | S5, S6 |

`.claude/hooks/slack-channels.sh` — каркас гарда з Theory 2. У `settings.json` він не зареєстрований, бо цільова конфігурація теорії його не містить. Ця гілка є відповіддю до теорії, а не до task-1: повний гард студент будує в task-1 на кейсі C16.

### Що не закрито

- **Платформи.** Sandbox працює на macOS, Linux і WSL2. На нативному Windows цих гарантій немає.
- **Шкідливий код.** Sandbox обмежує postinstall-скрипт, але не забороняє йому виконуватись. Для цього потрібні `ignore-scripts` і перевірка залежностей у CI. `npm install` у власному терміналі розробника конфігурація сесії не обмежує.
- **Канал Slack.** Правило дозволів не перевіряє параметри виклику, для цього потрібен гард. Каркас покриває лише `channel_id` у `slack_send_message`.
- **Секрети в коді.** Сканування секретів у CI немає: workflow запускає lint, typecheck і unit.
- **GitHub.** Environment з обов'язковим рев'юером і CODEOWNERS для `.github/workflows` налаштовують у репозиторії GitHub, а не в сесії.
- **Команди, яким потрібна база або Docker.** За документацією sandbox драйвери баз даних не працюють через його proxy, а до сервера на цій машині команда напряму не дістається. Тому `db:migrate`, `db:reset`, `db:seed`, `dev` і `test:integration` запускай у власному терміналі: через агента вони не дістануться ні бази, ні сокета Docker, навіть після підтвердження `ask`.

Реальною сесією Claude Code цю гілку не перевірено.

## Структура

```
src/
  api/             Fastify: /health, декларації клієнта, чернетки, подання
  config.ts        конфігурація з .env і значення за замовчуванням
  declarations/    розрахунок податку, подання через ДокатAPI
  store/           схема Drizzle, репозиторій, міграції, скидання бази
packages/
  dokat-client/    клієнт ДокатAPI, npm workspace @kvartal/dokat-client
drizzle/           міграції drizzle-kit
stand/
  dokat/           заглушка ДокатAPI: перевіряє ключ, видає квитанції
  seed.ts          вигадані ФОП для локальної роботи
tests/             unit-тести Vitest
tests/integration/ Vitest, Testcontainers (Postgres 16, потрібен Docker)
docs/              приклад особистих налаштувань
docker-compose.yml, .env.example, .npmrc, CLAUDE.md, .claude/settings.json,
.claude/hooks/, .github/workflows/ci.yml
```

## Запуск

Потрібні Node 22 і Docker. Для розробки використовуємо локальну базу з Docker Compose, налаштування за замовчуванням ведуть на неї.

```bash
npm ci
docker compose up -d --wait
npm run db:migrate
npm run db:seed
```

Заглушка ДокатAPI і сервіс, кожен в окремому терміналі:

```bash
npm run dokat:stub
npm run dev
```

API працює на `localhost:3000`, заглушка — на `localhost:4010`.

```bash
curl -s localhost:3000/health
curl -s localhost:3000/clients/1/declarations
curl -s -X POST localhost:3000/declarations/2/submit
curl -s -X POST localhost:3000/declarations -H 'content-type: application/json' -d '{"clientId":1,"year":2026,"quarter":3,"incomeKopecks":14000000}'
```

Сервіс і скрипти читають налаштування зі змінних оточення й файлу `.env`. Щоб змінити значення, скопіюй `.env.example` у `.env`. Формат змінних — у `.env.example`.

Якщо порт 5432 зайнятий, додай той самий `POSTGRES_PORT` до `docker compose up` і до кожної команди, що ходить у базу. Він діє, лише коли `DATABASE_URL` не задано:

```bash
POSTGRES_PORT=5434 docker compose up -d --wait
POSTGRES_PORT=5434 npm run db:migrate
POSTGRES_PORT=5434 npm run db:seed
POSTGRES_PORT=5434 npm run dev
```

Порт сервісу змінює `PORT`: `PORT=3100 npm run dev`.

Зупинити базу й прибрати її дані:

```bash
docker compose down -v
```

## Міграції

Міграції лежать у `drizzle/`, схема — у `src/store/schema.ts`. Міграцію, що ще не вийшла в реліз, правимо на місці, а не додаємо нову. `db:migrate` вдруге не застосовує міграцію, яка вже є в журналі, тому перевіряємо її на чистій базі:

```bash
npm run db:reset
npm run db:seed
```

`db:reset` видаляє схему бази й заново застосовує всі міграції.

## Перевірки

```bash
npm run build              # перевірка типів: сервіс виконує tsx, окремого артефакту немає
npm run lint
npm run test               # unit, без Docker і мережі
npm run test:integration   # Testcontainers сам підіймає postgres:16
```

## Версії

Node 22, TypeScript 5.6.3, Fastify 5.12.7, Drizzle ORM 0.45.4, drizzle-kit 0.31.11, pg 8.23.1, dotenv 18.0.9, Postgres 16, Vitest 5.0.5, ESLint 10.13.0.
