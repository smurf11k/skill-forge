# SkillForge

English version is also available: [README.md](README.md)

Внутрішня платформа для навчання співробітників, створена для інженерних команд. Користувачі проходять структуровані курси з уроків і квізів та відстежують власний прогрес. Адміністратори керують контентом, контролюють прогрес робітників і ролі користувачів.

---

## Технології

**Frontend** — React 19 + Vite, shadcn/ui, Tailwind CSS v3, @dnd-kit (drag reorder), axios, react-router-dom, lucide-react, react-markdown, remark-gfm, remark-github-blockquote-alert, @uiw/react-md-editor

**Backend** — Laravel 12, Sanctum (token auth), PostgreSQL

**Infrastructure** — PostgreSQL запускається в Docker, frontend dev server працює на Vite, backend запускається через `php artisan serve`, а документація проєкту збирається VitePress у папці `docs/`

---

## Як це працює

### Для співробітників

Після входу співробітник бачить персональний дашборд із прогресом по всіх курсах: скільки курсів призначено, завершено, у процесі виконання та не розпочато, а також середній бал за квізи. Картки курсів показують дедлайни та статуси у вигляді бейджів. Кожен курс складається з уроків і квізів у визначеному порядку. Урок позначається як завершений після натискання кнопки преходу на наступний урок, а квіз оцінюється одразу після його виконання. Щоб квіз зарахувався до завершення курсу, потрібно набрати 80% або більше. Невдалі спроби зберігаються, але не блокують прогрес, тому співробітник може пройти квіз повторно. Курс вважається завершеним, коли прочитані всі уроки та складені всі квізи.

Також доступна окрема сторінка результатів із прогресом по кожному курсу, історією квізів, дедлайнами та _можливістю скинути власний прогрес_ (експериментальна фіча).

Контент уроків підтримує Markdown-форматування і рендериться безпосередньо в перегляді курсу.

Підтримуються розширені Markdown-можливості, зокрема callouts у стилі GitHub (наприклад TIP, NOTE, WARNING, CAUTION). Вони обробляються через `remark-github-blockquote-alert` і стилізуються вручну під дизайн застосунку.

### Для адміністраторів

Адміністратори мають окремий дашборд зі статистикою по платформі: середній відсоток завершення серед усіх співробітників, співробітники у зоні ризику (нижче 50% прогресу) та відсоток завершення по кожному курсу. Сторінка Team Progress показує детальну інформацію по співробітнику і курсу окремо: скільки уроків завершено, квізів складено, середня успішність та статуси виконання курсів.

Сторінка Users має дві задачі: керування активними користувачами (зміна ролей і видалення) та керування запрошеннями в очікуванні (створення, повторне надсилання, відкликання).

Адміністратори також керують призначенням курсів і дедлайнами на сторінці Assignments: можуть призначати курси одному або багатьом користувачам, задавати дедлайни, повторно надсилати сповіщення й контролювати статуси призначень.

Контент керується через сторінку Manage Content. Курси, уроки та квізи можна створювати, редагувати, публікувати або зберігати як чернетки. Чернетки не видно співробітникам. У редакторі курсу уроки й квізи відображаються єдиним впорядкованим списком, який можна перетягувати для зміни порядку. Питання квізу редагуються прямо на сторінці редагування квізу. Контент уроків створюється у Markdown через редактор із режимами write/preview.

### Аутентифікація

Вхід реалізовано на токенах через Laravel Sanctum. Після логіну адміністратори перенаправляються на `/admin`, співробітники на `/`. Маршрути тільки для адмінів захищені і на frontend (redirect, якщо не admin), і на backend (403, якщо не admin). Чернетки (draft) курсів також недоступні для співробітників.

Нові користувачі підключаються через invite-токени. Адміністратор може створити запрошення та одразу надіслати email, а отримувач завершує створення облікового запису на публічній сторінці `/accept-invite`. Invite-токени можуть спливати, відкликатися або надсилатися повторно.

---

## Архітектура

```txt
skill-forge-pr/
├── docker-compose.yml
├── backend/                  # Laravel 12
│   ├── app/Http/Controllers/
│   │   ├── AuthController.php
│   │   ├── CourseController.php
│   │   ├── InviteController.php
│   │   ├── CourseAssignmentController.php
│   │   ├── LessonController.php
│   │   ├── LessonProgressController.php
│   │   ├── QuizController.php
│   │   ├── QuestionController.php
│   │   ├── ResultController.php
│   │   └── UserController.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
├── frontend/                 # React + Vite
│   └── src/
│       ├── App.jsx
│       ├── api/auth.js
│       ├── hooks/useCourseProgress.js
│       ├── components/
│       │   ├── admin/
│       │   │   └── ContentEditors.jsx
│       │   ├── common/
│       │   │   └── PageLoader.jsx
│       │   ├── EmployeeCourseCard.jsx
│       │   ├── Layout.jsx
│       │   ├── StatCard.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── course/
│       │   │   ├── buildCourseContentItems.js
│       │   │   ├── contentTypeMeta.js
│       │   │   ├── CourseMetaLine.jsx
│       │   │   └── CourseSection.jsx
│       │   └── markdown/
│       │       ├── LessonMarkdownEditor.jsx
│       │       └── MarkdownContent.jsx
│       └── pages/
│           ├── AdminAssignments.jsx
│           ├── AdminContent.jsx
│           ├── AdminCourseView.jsx
│           ├── AdminDashboard.jsx
│           ├── AdminTeamProgress.jsx
│           ├── AdminUsers.jsx
│           ├── AcceptInvite.jsx
│           ├── CourseView.jsx
│           ├── Courses.jsx
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           └── Results.jsx
└── docs/                     # VitePress documentation
	├── .vitepress/
	├── guide/
	├── reference/
	├── index.md
	└── roadmap.md
```

### Відповідальності backend

- `AuthController` відповідає за login/logout і видачу Sanctum-токенів.
- `InviteController` керує повним життєвим циклом запрошень: список очікуваних, створення, повторне надсилання/відкликання, перевірка публічного invite-токена та перетворення прийнятого запрошення на реальний акаунт.
- `CourseAssignmentController` відповідає за CRUD призначень, дедлайни, обчислення статусу дедлайнів і сповіщення щодо призначень.
- `UserController` обслуговує адмінське керування користувачами, а також агрегацію статистики платформи і прогресу команди.
- Контролери курсів, уроків, квізів, питань, результатів і прогресу реалізують навчальний workflow та відстеження завершення.

### Відповідальності frontend

- `App.jsx` підключає public, employee і admin маршрути, включно з публічною сторінкою прийняття запрошення.
- `hooks/useCourseProgress.js` збагачує дані курсів метриками прогресу, кількістю уроків/квізів, середнім балом і метаданими призначень.
- `components/EmployeeCourseCard.jsx` спільний компонент картки курсу для співробітника, що використовується в Dashboard і Courses.
- `components/common/PageLoader.jsx` уніфікує повторюваний loading wrapper на сторінках.
- `components/course/` містить спільні UI-хелпери для курсів: метадані уроків/квізів, іконки типів контенту та об'єднувач елементів контенту для редактора курсу.
- `components/admin/ContentEditors.jsx` централізує перевикористовувані форми редагування курсів, уроків, квізів і питань.
- `components/StatCard.jsx` перевикористовувана картка статистики з налаштовуваними візуальними акцентами (emoji або icon).
- `pages/AdminUsers.jsx` поєднує керування активними користувачами та pending invites в одному tabbed admin UI.
- `pages/AdminAssignments.jsx` керує призначенням курсів, дедлайнами та діями життєвого циклу призначень.
- `pages/AcceptInvite.jsx` валідує invite-токен, збирає ім'я/пароль нового користувача і одразу виконує вхід після створення акаунта.
- `api/auth.js` централізує axios-конфігурацію, додавання bearer-токена і збереження стану аутентифікації в local storage.

---

## Швидкий старт

**Необхідно** — Docker, PHP 8.2+, Composer, Node 18+

```powershell
# 1. Запустити базу даних
docker compose up -d

# 2. Встановити backend-залежності
cd backend
composer install

# 3. Налаштувати оточення
cp .env.example .env
# Set DB_HOST=127.0.0.1, DB_PORT=5432, DB_DATABASE=skillforge
# DB_USERNAME=skillforge_user, DB_PASSWORD=skillforge_pass
# Set FRONTEND_URL=http://localhost:5173
# Configure MAIL_* if you want invite emails to be sent instead of logged

# 4. Побудувати схему та заповнити демо-даними
php artisan migrate --seed

# 5. Запустити backend
php artisan serve

# 6. Встановити frontend-залежності та запустити dev server
cd ../frontend
npm install
npm run dev
```

Схема бази даних зберігається в Laravel-міграціях у `backend/database/migrations`, а mock/demo дані сідуються через `backend/database/seeders`.
Після запуску PostgreSQL виконайте `php artisan migrate --seed` у backend, щоб створити та заповнити базу.

Якщо потрібна повністю чиста перебудова бази та демо-контенту, виконайте `php artisan migrate:fresh --seed` з `backend/`.

Демо-контент уроків містить Markdown-форматування та callouts у стилі GitHub, щоб рендерер можна було протестувати на реалістичному контенті.

---

## Тестування

Backend-тести реалізовані через PHPUnit (Laravel feature tests) і покривають auth, courses, lessons, quizzes, questions, results, users, invites та assignments.

Щоб запустити тести локально:

```powershell
cd backend
php artisan test
```

---

## Документація

Документація проєкту знаходиться в папці `docs/` і побудована на VitePress.

Щоб запустити документацію локально:

```powershell
cd docs
npm install
npm run docs:dev
```

Це запустить сайт документації в режимі розробки з live reload.

---

## Огляд API

| Method | Endpoint                      | Description                                |
| ------ | ----------------------------- | ------------------------------------------ |
| POST   | `/api/login`                  | Authenticate, returns token                |
| POST   | `/api/logout`                 | Invalidate token                           |
| GET    | `/api/courses`                | List courses                               |
| POST   | `/api/courses`                | Create course                              |
| GET    | `/api/courses/{id}`           | Get single course                          |
| PUT    | `/api/courses/{id}`           | Update course                              |
| DELETE | `/api/courses/{id}`           | Delete course                              |
| GET    | `/api/courses/{id}/lessons`   | Lessons for a course                       |
| POST   | `/api/lessons`                | Create lesson                              |
| PUT    | `/api/lessons/reorder`        | Reorder lessons                            |
| PUT    | `/api/lessons/{id}`           | Update lesson                              |
| DELETE | `/api/lessons/{id}`           | Delete lesson                              |
| POST   | `/api/lessons/{id}/complete`  | Mark lesson complete                       |
| GET    | `/api/courses/{id}/progress`  | Completed lesson IDs for current user      |
| GET    | `/api/courses/{id}/quizzes`   | Quizzes for a course                       |
| POST   | `/api/quizzes`                | Create quiz                                |
| PUT    | `/api/quizzes/reorder`        | Reorder quizzes                            |
| GET    | `/api/quizzes/{id}`           | Get single quiz                            |
| PUT    | `/api/quizzes/{id}`           | Update quiz                                |
| DELETE | `/api/quizzes/{id}`           | Delete quiz                                |
| GET    | `/api/quizzes/{id}/questions` | List questions for quiz                    |
| POST   | `/api/quizzes/{id}/submit`    | Submit quiz answers, returns score         |
| POST   | `/api/questions`              | Create question                            |
| PUT    | `/api/questions/reorder`      | Reorder questions                          |
| PUT    | `/api/questions/{id}`         | Update question                            |
| DELETE | `/api/questions/{id}`         | Delete question                            |
| GET    | `/api/results/{userId}`       | Quiz results for a user                    |
| DELETE | `/api/results/{userId}/reset` | Reset all progress for a user              |
| GET    | `/api/users`                  | All users (admin only)                     |
| PUT    | `/api/users/{id}/role`        | Change user role (admin only)              |
| DELETE | `/api/users/{id}`             | Remove user (admin only)                   |
| GET    | `/api/invites/{token}`        | Resolve a public invite token              |
| POST   | `/api/invites/accept`         | Accept invite and create account           |
| GET    | `/api/invites`                | List pending invites (admin only)          |
| POST   | `/api/invites`                | Create invite (admin only)                 |
| POST   | `/api/invites/{id}/resend`    | Refresh and resend invite (admin only)     |
| DELETE | `/api/invites/{id}`           | Revoke invite (admin only)                 |
| GET    | `/api/assignments`            | List course assignments                    |
| POST   | `/api/assignments`            | Create assignment(s)                       |
| PUT    | `/api/assignments/{id}`       | Update assignment                          |
| DELETE | `/api/assignments/{id}`       | Delete assignment                          |
| GET    | `/api/admin/stats`            | Platform-wide stats (admin only)           |
| GET    | `/api/admin/team-progress`    | All results + lesson progress (admin only) |

---

## Додатково

[Design Template](https://practice-skill-forge-template.netlify.app/)
