# 09-auth — NoteHub

Next.js App Router, TypeScript, Axios, TanStack Query, Zustand, CSS Modules and cookie authentication.

## Локальный запуск

1. Откройте папку `09-auth`, в которой лежит package.json.
2. Выполните `npm install`.
3. Создайте `.env.local` рядом с package.json:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
```

В девятом задании NEXT_PUBLIC_NOTEHUB_TOKEN не используется. Вход выполняется по email и паролю через новый бэкенд https://notehub-api.goit.study. Старые аккаунты/заметки с предыдущего бэкенда сюда не переносятся.

4. Выполните `npm run dev` и откройте http://localhost:3000. Если порт занят, освободите 3000 или поменяйте NEXT_PUBLIC_API_URL на фактический порт и перезапустите сервер.
5. Откройте Sign up, введите свой email и пароль (не менее 6 символов). После регистрации откроется профиль. Пароль используется только для запроса авторизации и не сохраняется в Zustand/localStorage.

## Что реализовано

- Публичная главная; клиентские `/sign-in`, `/sign-up` в группе `(auth routes)` с отдельным layout.tsx.
- Приватные `/notes/...`, `/profile`, `/profile/edit` в `(private routes)` с отдельным layout.tsx. URL не содержат названий групп.
- `lib/api/api.ts`: общий Axios с withCredentials и baseURL из NEXT_PUBLIC_API_URL + '/api'.
- `lib/api/clientApi.ts`: fetchNotes, fetchNoteById, createNote, deleteNote, register, login, logout, checkSession, getMe, updateMe.
- `lib/api/serverApi.ts`: серверные fetchNotes, fetchNoteById, getMe, checkSession с передачей Cookie в headers. Запросы сервера также проходят через локальные Next API-маршруты.
- `app/api`: предоставленные GoIT обработчики из ветки hw-09-api-files, скопированные без изменений. Форматтер исключает эту папку. Их Axios отправляет запросы новому бэкенду.
- `types/user.ts` содержит только User с email, username, avatar. API-типы находятся в соответствующих API-модулях.
- Zustand authStore: user, isAuthenticated, setUser, clearIsAuthenticated. Авторизация не сохраняется в localStorage; сессия восстанавливается по HttpOnly cookies.
- AuthProvider вложен в TanStackProvider и оборачивает Header, children, modal и Footer. При запуске проверяет сессию, получает профиль, обновляет или очищает состояние. Защита от устаревшего ответа предотвращает перезапись состояния после входа/выхода.
- AuthNavigation условно показывает Login/Sign up либо Profile/email/Logout. Logout очищает состояние авторизации, кеш запросов и черновик, затем отправляет на /sign-in. Ссылки на auth/profile используют prefetch={false}.
- proxy.ts с privateRoutes, publicRoutes и matcher защищает приватные маршруты и направляет авторизованного пользователя со страниц входа/регистрации в профиль. Проверяет сессию и профиль; обновленные cookies передает браузеру и в SSR текущего запроса.
- Серверная страница профиля, редактирование username с сохранением через API и обновлением Zustand. Email и аватар не редактируются; аватар отображается через next/image, ac.goit.global разрешен в remotePatterns.
- Сохранены SEO, Roboto, поиск, пагинация, фильтры, создание/удаление, Zustand-черновик в localStorage, sidebar и перехваченное модальное превью. Метаданные прописаны явно в файлах страниц.
- app/default.tsx обеспечивает fallback корневого children-слота при строгой проверке параллельных маршрутов в Next.js 16.

## Проверка

```bash
npm run build
npm run format:check
```

Сборка с TypeScript и Roboto прошла. На настоящем локальном production-сервере с тестовыми ответами внешнего API проверены регистрация/вход, ошибочный пароль, cookies, доступ гостя и авторизованного пользователя, профиль/заметки в HTML (SSR), изменение профиля, создание/удаление заметок, обновление сессии, передача новых cookies в SSR, отклонение неверного токена, выход и перехват маршрута превью. Клиентские проверки подтвердили условную навигацию, восстановление сессии, формы и ошибки, начальное имя в редакторе, сохранение и очистку состояния/кеша после выхода. Готовые API-маршруты побайтово сверены с исходными.

Реальный аккаунт во время подготовки не создавался. Перед сдачей проверьте с вашим аккаунтом:

1. Без входа откройте /notes/filter/all и /profile — должен открыться вход.
2. Зарегистрируйтесь, проверьте профиль и изменение имени.
3. Обновите страницу — авторизация должна сохраниться.
4. Создайте заметку; проверьте поиск, фильтр, View details и удаление.
5. Заполните черновик, нажмите Cancel, вернитесь и обновите страницу — черновик должен сохраниться.
6. Выйдите; приватные страницы должны снова отправлять на вход.
7. Войдите с неверным паролем — сообщение об ошибке; затем с верным — профиль.

## GitHub и Vercel

Создайте репозиторий `09-auth` и загрузите исходники. Не загружайте node_modules, .next и .env.local.

В Vercel импортируйте `09-auth` и оставьте настройки Next.js по умолчанию. Переменная окружения называется **NEXT_PUBLIC_API_URL**, а не NEXT_PUBLIC_NOTEHUB_TOKEN. В ней должен быть постоянный HTTPS-адрес именно вашего приложения, например https://09-auth-your-name.vercel.app — без /api на конце.

Если постоянный домен ещё неизвестен: выполните первый Deploy, скопируйте production URL из Domains, добавьте его в Settings → Environment Variables как NEXT_PUBLIC_API_URL и сделайте Redeploy. Изменение этой публичной переменной требует новой сборки. Не указывайте временный адрес отдельного deployment и не оставляйте localhost на Vercel. Если включена Deployment Protection, она не должна блокировать публичный production URL и внутренние серверные запросы к его API.

После Ready проверьте регистрацию, вход, профиль и заметки на живом сайте. В LMS сдайте ссылку на GitHub и постоянный production URL из Domains.

Стили авторизации: https://github.com/goitacademy/react-notehub-styles/tree/hw-09-styles. Готовые API-маршруты: https://github.com/goitacademy/react-notehub-styles/tree/hw-09-api-files. Стили остальных страниц перенесены из предыдущей работы; лицензия в STYLES-LICENSE.
