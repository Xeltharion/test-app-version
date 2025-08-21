# Mobile App Config Service

Сервис выдаёт конфигурацию мобильного приложения (assets, definitions, точки входа backend и notifications) по версии приложения и платформе.

## Возможности
- Получение конфигурации приложения по версии и платформе
- Поддержка правил совместимости SemVer для assets и definitions
- Кэширование ответов
- API документация Swagger
- Docker

## Быстрый старт

Установка зависимостей:

```bash
npm install
```

Сборка:

```bash
npm run build
```

Запуск в режиме разработки (watch):

```bash
npm run start:dev
```

Запуск production (после сборки):

```bash
npm run start:prod
```

Приложение слушает порт, указанный в переменной окружения `PORT` (по умолчанию 3000).

## Docker

Собрать и поднять контейнер через Docker Compose:

```bash
docker compose up --build
```
Или в зависимости от версии Docker Compose:
```bash
docker-compose up --build
```

Или собрать/запустить образ вручную:

```bash
docker build -t mobile-app-config .
docker run -p 3000:3000 mobile-app-config
```

## API

Основный эндпоинт: `GET /config`

Параметры запроса:
- `appVersion` — версия приложения в формате MAJOR.MINOR.PATCH
- `platform` — `android` или `ios`

Пример запроса:

```bash
curl "http://localhost:3000/config?appVersion=13.6.956&platform=android"
```

Swagger (документация): `http://localhost:3000/api/docs`

Коды ответов:
- `200` — конфигурация найдена
- `400` — неверные параметры
- `404` — конфигурация для заданной версии/платформы не найдена
- `500` — внутренняя ошибка сервера

## Тесты

E2E тесты запускаются командой:

```bash
npm run test:e2e
```

## Переменные окружения
Скопируйте файл `.env.example` в `.env` и отредактируйте его под свои нужды.

```bash
cp .env.example .env
```
