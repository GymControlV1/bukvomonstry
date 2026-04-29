# БуквоМонстры

Отдельная детская игра для GitHub Pages с облачным сохранением прогресса в Google Sheets.

## Что лежит в папке

- `index.html` — вся игра
- `google-apps-script-backend.gs` — backend для Google Apps Script + Google Sheets

## Как выложить на GitHub Pages

1. Загрузите папку `bukvomonstry` в репозиторий GitHub.
2. Откройте `Settings` → `Pages`.
3. Включите публикацию из ветки `main` и папки `/ (root)`.
4. Игра будет доступна по адресу вида:
   - `https://USERNAME.github.io/REPO/bukvomonstry/`

Для текущего репозитория это будет:

- `https://gymcontrolv1.github.io/gymcontrolv1/bukvomonstry/`

Если GitHub Pages уже включён для репозитория.

## Как подключить Google Sheets

1. Создайте Google Sheet для хранения прогресса.
2. Откройте `Расширения` → `Apps Script`.
3. Вставьте код из `google-apps-script-backend.gs`.
4. Если скрипт открыт не внутри нужной таблицы, заполните `SPREADSHEET_ID` вверху файла.
5. Нажмите `Deploy` → `New deployment` → `Web app`.
6. Параметры деплоя:
   - `Execute as`: `Me`
   - `Who has access`: `Anyone`
7. Скопируйте URL web app.

## Как включить облачное сохранение в игре

1. Откройте игру.
2. Нажмите `Настроить облако`.
3. Введите:
   - имя игрока
   - код игрока
   - URL web app из Apps Script
4. Нажмите `Сохранить в облако`.

На другом устройстве:

1. Откройте ту же ссылку GitHub Pages.
2. Нажмите `Настроить облако`.
3. Введите тот же код игрока и тот же Apps Script URL.
4. Нажмите `Загрузить из облака`.

## Как работает синхронизация

- Игра по-прежнему хранит локальный прогресс в `localStorage`.
- При облачной настройке прогресс дополнительно сохраняется в Google Sheets.
- Для защиты от перезаписи используется принцип "последняя более новая версия выигрывает" по `updatedAt`.
