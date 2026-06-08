# Offline-first PWA трекер расходов

Тестовый проект на TypeScript: приложение для учёта расходов с локальным сохранением данных и автоматической синхронизацией с backend после восстановления соединения.

## Возможности

- создание статей расходов с валидацией названия, суммы и даты;
- отображение списка расходов и итоговой суммы;
- удаление созданных статей;
- live-статус соединения с сетью и backend;
- offline-first сценарий: записи сохраняются в IndexedDB и попадают в очередь синхронизации;
- синхронизация локальных изменений с PostgreSQL через Express API.

## Стек

### Backend

- Node.js
- Express
- PostgreSQL
- Drizzle ORM
- Zod

### Frontend

- React
- Vite
- TypeScript
- Dexie / IndexedDB
- React Hook Form
- Zod
- Axios
- vite-plugin-pwa / Workbox

### PWA

Приложение работает как Progressive Web App: оболочка и статика кэшируются service worker'ом, а данные расходов хранятся локально в IndexedDB и синхронизируются с сервером при появлении сети.

PWA собирается через `vite-plugin-pwa`


## Запуск

### Backend

Создать `.env` из примера:

```bash
cd api
cp .env.example .env
```

Запустить PostgreSQL, миграции и сервер:

```bash
docker compose up -d
npm run db:setup
npm run dev

# Дополнительные команды работы с БД через Drizzle
# Генерация Drizzle миграций
npm run db:generate
# Запуск миграции
npm run db:migrate
# Сидирование данных
npm run db:seed

```

По умолчанию API доступно на `http://localhost:3000`.

### Frontend

```bash
cd web
npm install
npm run dev
```

По умолчанию приложение доступно на `http://localhost:5173`.
Для переопределения API URL можно использовать переменную окружения `VITE_API_URL`.

### PWA

Для полноценной работы и проверки оффлайн версии приложения - нужно выполнить билд приложения и установить его через браузер.

**Продакшен-сборка** (для полной поддержки оффлайн):

```bash
cd web
npm run build
npm run preview
```

Preview по умолчанию на `http://localhost:4173`.
После установки приложение открывается в отдельном окне (`display: standalone`), без панели браузера.

#### Установка на устройство

- **Chrome / Edge (desktop)** — иконка «Установить» в адресной строке или меню → «Установить приложение».
- **Android (Chrome)** — «Добавить на главный экран» / «Установить приложение».
- **iOS (Safari)** — «Поделиться» → «На экран Домой».

**Разработка** (работает только с вкл dev сервером)

```bash
cd web
npm run dev
```


## Структура проекта

```text
api/  - backend: Express API, Drizzle schema, миграции и работа с PostgreSQL
web/  - frontend: React/Vite приложение с offline-first хранением и синхронизацией
```

Основные frontend-слои:

```text
app/      - инициализация приложения, провайдеры и регистрация PWA
pages/    - страницы
features/ - бизнес-фичи: расходы и статус соединения
shared/   - общие API-клиенты, DB-инфраструктура, UI и утилиты
```
