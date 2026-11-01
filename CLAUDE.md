# kvartal-api

Бекенд сервісу податкової звітності «Квартал». TypeScript (strict), Node 22, Fastify 5, Drizzle ORM, Postgres 16, Vitest.

- src/api — HTTP-маршрути
- src/declarations — декларації, розрахунок податку, подання
- src/store — схема Drizzle, репозиторії, міграції, скидання бази
- src/config.ts — конфігурація
- packages/dokat-client — клієнт ДокатAPI (@kvartal/dokat-client)
- stand — локальна заглушка ДокатAPI й тестові дані
- drizzle — міграції

## Команди

```bash
npm run build              # перевірка типів
npm run lint
npm run test               # unit, без Docker і мережі
npm run test:integration   # Testcontainers, потрібен Docker
npm run db:generate        # нова міграція зі схеми
npm run db:migrate
npm run db:reset           # чиста база: видаляє схему й застосовує міграції заново
```

## Міграції

Міграцію, що ще не вийшла в реліз, правимо на місці, а не додаємо нову. Перевіряємо її на чистій базі через npm run db:reset: db:migrate вдруге не застосовує міграцію, яка вже є в журналі.

## Безпека
- Ніколи не читай .env і не виводь його вміст.
- Не виводь токени й ключі в термінал чи лог.
- Не пиши в Slack без мого дозволу.
- Не пуш у main напряму, лише через PR.
