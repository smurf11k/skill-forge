<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SkillForgeDemoSeeder extends Seeder
{
    public function run(): void
    {
        $userIds = $this->seedUsers();
        $courseIds = $this->seedCourses();
        $lessonIds = $this->seedLessons($courseIds);
        $quizIds = $this->seedQuizzes($courseIds);

        $this->seedQuestions($quizIds);
        $this->seedLessonProgress($userIds, $lessonIds);
        $this->seedResults($userIds, $quizIds);
        $this->seedCourseAssignments($userIds, $courseIds);
    }

    private function seedUsers(): array
    {
        $now = now();
        $adminPassword = Hash::make('admin123');
        $employeePassword = Hash::make('employee123');
        $mockPassword = Hash::make('mock123');

        $users = [
            ['name' => 'Admin', 'email' => 'admin@skillforge.com', 'password' => $adminPassword, 'role' => 'admin'],
            ['name' => 'Test Employee', 'email' => 'employee@skillforge.com', 'password' => $employeePassword, 'role' => 'employee'],
            ['name' => 'Alice Johnson', 'email' => 'alice@skillforge.com', 'password' => $mockPassword, 'role' => 'employee'],
            ['name' => 'Bob Smith', 'email' => 'bob@skillforge.com', 'password' => $mockPassword, 'role' => 'employee'],
            ['name' => 'Carol White', 'email' => 'carol@skillforge.com', 'password' => $mockPassword, 'role' => 'employee'],
            ['name' => 'David Brown', 'email' => 'david@skillforge.com', 'password' => $mockPassword, 'role' => 'employee'],
            ['name' => 'Eva Green', 'email' => 'eva@skillforge.com', 'password' => $mockPassword, 'role' => 'employee'],
            ['name' => 'Frank Miller', 'email' => 'frank@skillforge.com', 'password' => $mockPassword, 'role' => 'employee'],
            ['name' => 'Grace Lee', 'email' => 'grace@skillforge.com', 'password' => $mockPassword, 'role' => 'employee'],
            ['name' => 'Henry Walker', 'email' => 'henry@skillforge.com', 'password' => $mockPassword, 'role' => 'employee'],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['email' => $user['email']],
                array_merge($user, [
                    'email_verified_at' => $now,
                    'remember_token' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }

        return DB::table('users')->pluck('id', 'email')->all();
    }

    private function seedCourses(): array
    {
        $now = now();

        $courses = [
            ['title' => 'Git & Collaboration Basics', 'description' => 'Core team workflow for branching, commit hygiene, pull requests, and code review etiquette.', 'status' => 'published'],
            ['title' => 'Secure Coding Fundamentals', 'description' => 'Introduction to common application security risks and everyday secure development habits.', 'status' => 'published'],
            ['title' => 'Docker Essentials', 'description' => 'Practical container basics for local development and service-based applications.', 'status' => 'published'],
            ['title' => 'REST API Design', 'description' => 'Designing clean resource-based APIs, request validation, and response consistency.', 'status' => 'published'],
            ['title' => 'Incident Response Basics', 'description' => 'How engineers react to production incidents, triage problems, and communicate clearly.', 'status' => 'published'],
            ['title' => 'Frontend Accessibility Draft', 'description' => 'Draft-only course for accessibility improvements and inclusive UI patterns.', 'status' => 'draft'],
        ];

        foreach ($courses as $course) {
            DB::table('courses')->updateOrInsert(
                ['title' => $course['title']],
                array_merge($course, [
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }

        return DB::table('courses')->pluck('id', 'title')->all();
    }

    private function seedLessons(array $courseIds): array
    {
        $now = now();

        $lessons = [
            [
                'course_title' => 'Git & Collaboration Basics',
                'title' => 'Why Version Control Matters',
                'content' => <<<'MD'
# Why Version Control Matters

Version control helps a team track changes, collaborate safely, and recover from mistakes.

- Track progress over time
- Review work before merge
- Recover from bad changes quickly

> [!TIP]
> Keep commits small and descriptive so review stays readable.

Try a quick sanity check with `git status` before you commit.
MD,
                'order_number' => 0,
                'status' => 'published'
            ],
            [
                'course_title' => 'Git & Collaboration Basics',
                'title' => 'Branching Strategy',
                'content' => <<<'MD'
## Branching Strategy

Use short-lived feature branches and keep them focused on one change.

```bash
git checkout -b feature/login-flow
```

> [!NOTE]
> A branch should be easy to merge or discard without affecting the main line of work.
MD,
                'order_number' => 1,
                'status' => 'published'
            ],
            [
                'course_title' => 'Git & Collaboration Basics',
                'title' => 'Pull Requests and Reviews',
                'content' => <<<'MD'
### Pull Requests and Reviews

Pull requests are a checkpoint for code quality, shared understanding, and risk reduction.

- Open them early
- Add context in the description
- Review for correctness before style

> [!WARNING]
> Merging without review can spread mistakes quickly.
MD,
                'order_number' => 3,
                'status' => 'published'
            ],
            [
                'course_title' => 'Secure Coding Fundamentals',
                'title' => 'Common Web Risks',
                'content' => <<<'MD'
# Common Web Risks

Engineers should recognize the risks that show up most often in web apps.

- Injection
- Broken access control
- Unsafe assumptions about user input

> [!CAUTION]
> Never trust input just because it came from your own frontend.
MD,
                'order_number' => 0,
                'status' => 'published'
            ],
            [
                'course_title' => 'Secure Coding Fundamentals',
                'title' => 'Input Validation',
                'content' => <<<'MD'
## Input Validation

Validation should happen server-side for all untrusted input.

```php
$request->validate([
        'email' => ['required', 'email'],
]);
```

> [!TIP]
> Validation and authorization solve different problems and should be handled separately.
MD,
                'order_number' => 1,
                'status' => 'published'
            ],
            [
                'course_title' => 'Secure Coding Fundamentals',
                'title' => 'Secrets and Credentials',
                'content' => <<<'MD'
### Secrets and Credentials

Credentials should never be hardcoded in source code.

```env
APP_KEY=base64:...
DB_PASSWORD=secret
```

> [!WARNING]
> Store secrets in environment variables or a secret manager, not in the repository.
MD,
                'order_number' => 3,
                'status' => 'published'
            ],
            [
                'course_title' => 'Docker Essentials',
                'title' => 'Containers vs Virtual Machines',
                'content' => <<<'MD'
# Containers vs Virtual Machines

Containers share the host kernel and are lighter than virtual machines.

- Faster startup
- Easier local setup
- Better environment consistency

> [!NOTE]
> Use containers when you want repeatable development environments.
MD,
                'order_number' => 0,
                'status' => 'published'
            ],
            [
                'course_title' => 'Docker Essentials',
                'title' => 'Images, Containers, and Layers',
                'content' => <<<'MD'
## Images, Containers, and Layers

Images are built from layers, and containers are runnable instances of images.

```bash
docker build -t skillforge-app .
```

> [!TIP]
> Layer caching can speed up rebuilds a lot when dependencies do not change.
MD,
                'order_number' => 1,
                'status' => 'published'
            ],
            [
                'course_title' => 'Docker Essentials',
                'title' => 'Docker Compose Basics',
                'content' => <<<'MD'
### Docker Compose Basics

Compose helps define multi-service setups with shared networking, volumes, and environment configuration.

```yaml
services:
    app:
        build: .
```

> [!NOTE]
> Compose is ideal for local stacks and demo environments.
MD,
                'order_number' => 3,
                'status' => 'published'
            ],
            [
                'course_title' => 'REST API Design',
                'title' => 'Resources and Endpoints',
                'content' => <<<'MD'
# Resources and Endpoints

REST APIs should model domain resources clearly.

- `/courses`
- `/lessons`
- `/quizzes`

> [!TIP]
> Endpoint names should stay predictable across the API.
MD,
                'order_number' => 0,
                'status' => 'published'
            ],
            [
                'course_title' => 'REST API Design',
                'title' => 'HTTP Methods and Status Codes',
                'content' => <<<'MD'
## HTTP Methods and Status Codes

Use HTTP methods according to intent and return clear status codes.

```http
POST /api/courses
201 Created
```

> [!NOTE]
> Clients rely on status codes to understand whether a request succeeded, failed, or needs correction.
MD,
                'order_number' => 1,
                'status' => 'published'
            ],
            [
                'course_title' => 'REST API Design',
                'title' => 'Validation and Error Responses',
                'content' => <<<'MD'
### Validation and Error Responses

Validation errors should be structured, readable, and consistent.

```json
{
    "error": "Validation failed"
}
```

> [!WARNING]
> Keep error shapes stable so frontend handling stays simple.
MD,
                'order_number' => 3,
                'status' => 'published'
            ],
            [
                'course_title' => 'Incident Response Basics',
                'title' => 'What Counts as an Incident',
                'content' => <<<'MD'
# What Counts as an Incident

Incidents include service outages, severe degradations, data exposure risks, and production issues affecting users or business operations.

- Availability problems
- Security exposure
- Broken critical workflows

> [!CAUTION]
> Treat security incidents as urgent even when the impact looks small at first.
MD,
                'order_number' => 0,
                'status' => 'published'
            ],
            [
                'course_title' => 'Incident Response Basics',
                'title' => 'Triage and Prioritization',
                'content' => <<<'MD'
## Triage and Prioritization

Early incident handling focuses on severity, blast radius, time sensitivity, and user impact.

> [!TIP]
> Stabilize first, then investigate the root cause.
MD,
                'order_number' => 1,
                'status' => 'published'
            ],
            [
                'course_title' => 'Incident Response Basics',
                'title' => 'Communication During Incidents',
                'content' => <<<'MD'
### Communication During Incidents

Clear updates reduce confusion.

> [!NOTE]
> Internal and external communication should be factual, timely, and calm.

- What happened
- What is impacted
- What happens next
MD,
                'order_number' => 3,
                'status' => 'published'
            ],
            [
                'course_title' => 'Frontend Accessibility Draft',
                'title' => 'Semantic HTML Basics',
                'content' => <<<'MD'
# Semantic HTML Basics

Use semantic structure to improve accessibility, navigation, and assistive technology support.

```html
<main>
    <article>
```

> [!TIP]
> Landmarks help screen reader users understand page structure faster.
MD,
                'order_number' => 0,
                'status' => 'draft'
            ],
            [
                'course_title' => 'Frontend Accessibility Draft',
                'title' => 'Keyboard Navigation',
                'content' => <<<'MD'
## Keyboard Navigation

Interfaces should remain usable without a mouse and should provide visible focus states.

- Tab order should be logical
- Interactive elements should be reachable
- Focus should never disappear

> [!WARNING]
> Do not trap keyboard users inside one widget or dialog.
MD,
                'order_number' => 1,
                'status' => 'draft'
            ],
            [
                'course_title' => 'Frontend Accessibility Draft',
                'title' => 'Markdown Callout Playground',
                'content' => <<<'MD'
# Markdown Callout Playground

This lesson exists only to show the renderer's markdown and alert styling in one place.

> [!TIP]
> Use callouts to highlight practical advice or shortcuts.

> [!NOTE]
> Notes work well for clarifying details that should not interrupt the main flow.

> [!WARNING]
> Warnings are best reserved for behavior that can surprise a learner.

> [!CAUTION]
> Caution blocks should call out irreversible or risky actions.
MD,
                'order_number' => 2,
                'status' => 'draft'
            ],
        ];

        foreach ($lessons as $lesson) {
            DB::table('lessons')->updateOrInsert(
                [
                    'course_id' => $courseIds[$lesson['course_title']],
                    'title' => $lesson['title'],
                ],
                [
                    'content' => $lesson['content'],
                    'order_number' => $lesson['order_number'],
                    'status' => $lesson['status'],
                    'course_id' => $courseIds[$lesson['course_title']],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        return DB::table('lessons')
            ->join('courses', 'lessons.course_id', '=', 'courses.id')
            ->select('lessons.id', 'lessons.title', 'courses.title as course_title')
            ->get()
            ->mapWithKeys(fn($lesson) => ["{$lesson->course_title}|{$lesson->title}" => $lesson->id])
            ->all();
    }

    private function seedQuizzes(array $courseIds): array
    {
        $now = now();

        $quizzes = [
            ['course_title' => 'Git & Collaboration Basics', 'title' => 'Git Workflow Quiz', 'order_number' => 2, 'status' => 'published'],
            ['course_title' => 'Secure Coding Fundamentals', 'title' => 'Secure Coding Quiz', 'order_number' => 2, 'status' => 'published'],
            ['course_title' => 'Docker Essentials', 'title' => 'Docker Concepts Quiz', 'order_number' => 2, 'status' => 'published'],
            ['course_title' => 'REST API Design', 'title' => 'REST API Quiz', 'order_number' => 2, 'status' => 'published'],
            ['course_title' => 'Incident Response Basics', 'title' => 'Incident Response Quiz', 'order_number' => 2, 'status' => 'published'],
            ['course_title' => 'Frontend Accessibility Draft', 'title' => 'Accessibility Basics Quiz', 'order_number' => 2, 'status' => 'draft'],
        ];

        foreach ($quizzes as $quiz) {
            DB::table('quizzes')->updateOrInsert(
                [
                    'course_id' => $courseIds[$quiz['course_title']],
                    'title' => $quiz['title'],
                ],
                [
                    'order_number' => $quiz['order_number'],
                    'status' => $quiz['status'],
                    'course_id' => $courseIds[$quiz['course_title']],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        return DB::table('quizzes')
            ->join('courses', 'quizzes.course_id', '=', 'courses.id')
            ->select('quizzes.id', 'quizzes.title', 'courses.id as course_id')
            ->get()
            ->mapWithKeys(fn($quiz) => [$quiz->title => ['quiz_id' => $quiz->id, 'course_id' => $quiz->course_id]])
            ->all();
    }

    private function seedQuestions(array $quizIds): void
    {
        $now = now();

        $questions = [
            ['quiz_title' => 'Git Workflow Quiz', 'order_number' => 0, 'question_text' => 'What is the main purpose of a pull request?', 'option_a' => 'To rename a branch', 'option_b' => 'To review and discuss code before merge', 'option_c' => 'To delete old commits', 'option_d' => 'To restart the repository', 'correct_answer' => 'b'],
            ['quiz_title' => 'Git Workflow Quiz', 'order_number' => 1, 'question_text' => 'Why use short-lived feature branches?', 'option_a' => 'To avoid all testing', 'option_b' => 'To reduce merge complexity and keep work isolated', 'option_c' => 'To remove commit history', 'option_d' => 'To replace code review', 'correct_answer' => 'b'],
            ['quiz_title' => 'Git Workflow Quiz', 'order_number' => 2, 'question_text' => 'What is a good code review practice?', 'option_a' => 'Ignore context and approve quickly', 'option_b' => 'Comment only on formatting', 'option_c' => 'Give specific, constructive feedback', 'option_d' => 'Merge before reading', 'correct_answer' => 'c'],
            ['quiz_title' => 'Git Workflow Quiz', 'order_number' => 3, 'question_text' => 'What does version control help with?', 'option_a' => 'Tracking changes over time', 'option_b' => 'Cooking recipes', 'option_c' => 'Replacing documentation', 'option_d' => 'Removing collaboration', 'correct_answer' => 'a'],
            ['quiz_title' => 'Secure Coding Quiz', 'order_number' => 0, 'question_text' => 'Where should validation always happen?', 'option_a' => 'Only in the browser', 'option_b' => 'Only in documentation', 'option_c' => 'On the server side', 'option_d' => 'Inside CSS', 'correct_answer' => 'c'],
            ['quiz_title' => 'Secure Coding Quiz', 'order_number' => 1, 'question_text' => 'Which is a bad practice?', 'option_a' => 'Using environment variables', 'option_b' => 'Hardcoding secrets in code', 'option_c' => 'Validating input', 'option_d' => 'Restricting access', 'correct_answer' => 'b'],
            ['quiz_title' => 'Secure Coding Quiz', 'order_number' => 2, 'question_text' => 'What does authorization answer?', 'option_a' => 'Is the input formatted correctly?', 'option_b' => 'Is the user allowed to do this?', 'option_c' => 'Did the UI render?', 'option_d' => 'Is the password hashed?', 'correct_answer' => 'b'],
            ['quiz_title' => 'Secure Coding Quiz', 'order_number' => 3, 'question_text' => 'Which risk category is common in web apps?', 'option_a' => 'Broken access control', 'option_b' => 'Printer overheating', 'option_c' => 'Slow typing speed', 'option_d' => 'Audio distortion', 'correct_answer' => 'a'],
            ['quiz_title' => 'Docker Concepts Quiz', 'order_number' => 0, 'question_text' => 'What is a container?', 'option_a' => 'A physical server', 'option_b' => 'A runnable instance of an image', 'option_c' => 'A package registry', 'option_d' => 'A VM hypervisor', 'correct_answer' => 'b'],
            ['quiz_title' => 'Docker Concepts Quiz', 'order_number' => 1, 'question_text' => 'Why are image layers useful?', 'option_a' => 'They reduce readability', 'option_b' => 'They improve caching and reuse', 'option_c' => 'They replace networking', 'option_d' => 'They store passwords in plain text', 'correct_answer' => 'b'],
            ['quiz_title' => 'Docker Concepts Quiz', 'order_number' => 2, 'question_text' => 'What does Docker Compose help with?', 'option_a' => 'Writing CSS', 'option_b' => 'Running multiple services together', 'option_c' => 'Replacing source control', 'option_d' => 'Editing database rows manually', 'correct_answer' => 'b'],
            ['quiz_title' => 'Docker Concepts Quiz', 'order_number' => 3, 'question_text' => 'Containers are generally...', 'option_a' => 'Heavier than virtual machines in typical dev workflows', 'option_b' => 'Lighter than full virtual machines', 'option_c' => 'Unrelated to deployment consistency', 'option_d' => 'Only usable in production', 'correct_answer' => 'b'],
            ['quiz_title' => 'REST API Quiz', 'order_number' => 0, 'question_text' => 'What should REST endpoints usually model?', 'option_a' => 'Random UI components', 'option_b' => 'Database backups only', 'option_c' => 'Domain resources', 'option_d' => 'CSS classes', 'correct_answer' => 'c'],
            ['quiz_title' => 'REST API Quiz', 'order_number' => 1, 'question_text' => 'Why are consistent error responses useful?', 'option_a' => 'They make debugging harder', 'option_b' => 'They help clients handle failures predictably', 'option_c' => 'They remove validation needs', 'option_d' => 'They replace documentation entirely', 'correct_answer' => 'b'],
            ['quiz_title' => 'REST API Quiz', 'order_number' => 2, 'question_text' => 'Which HTTP method is commonly used for creating resources?', 'option_a' => 'GET', 'option_b' => 'POST', 'option_c' => 'TRACE', 'option_d' => 'HEAD', 'correct_answer' => 'b'],
            ['quiz_title' => 'REST API Quiz', 'order_number' => 3, 'question_text' => 'What should status codes communicate?', 'option_a' => 'Only frontend theme preference', 'option_b' => 'Whether the server likes the request', 'option_c' => 'The outcome category of the request', 'option_d' => 'Database table size', 'correct_answer' => 'c'],
            ['quiz_title' => 'Incident Response Quiz', 'order_number' => 0, 'question_text' => 'What is triage during an incident?', 'option_a' => 'Designing a logo', 'option_b' => 'Prioritizing and assessing the issue', 'option_c' => 'Renaming the app', 'option_d' => 'Deleting logs', 'correct_answer' => 'b'],
            ['quiz_title' => 'Incident Response Quiz', 'order_number' => 1, 'question_text' => 'Which factor matters early in an incident?', 'option_a' => 'Font choice', 'option_b' => 'Blast radius', 'option_c' => 'Preferred editor theme', 'option_d' => 'Whitespace style', 'correct_answer' => 'b'],
            ['quiz_title' => 'Incident Response Quiz', 'order_number' => 2, 'question_text' => 'Good incident communication should be...', 'option_a' => 'Vague and delayed', 'option_b' => 'Calm, factual, and timely', 'option_c' => 'Private to one engineer only', 'option_d' => 'Based on guesses', 'correct_answer' => 'b'],
            ['quiz_title' => 'Incident Response Quiz', 'order_number' => 3, 'question_text' => 'Which is an example of an incident?', 'option_a' => 'A severe production outage', 'option_b' => 'A renamed local branch', 'option_c' => 'A typo in a private note', 'option_d' => 'A dark mode preference change', 'correct_answer' => 'a'],
            ['quiz_title' => 'Accessibility Basics Quiz', 'order_number' => 0, 'question_text' => 'Why is semantic HTML useful?', 'option_a' => 'Only for styling', 'option_b' => 'It improves accessibility and structure', 'option_c' => 'It removes the need for JavaScript', 'option_d' => 'It replaces routing', 'correct_answer' => 'b'],
        ];

        foreach ($questions as $question) {
            DB::table('questions')->updateOrInsert(
                [
                    'quiz_id' => $quizIds[$question['quiz_title']]['quiz_id'],
                    'order_number' => $question['order_number'],
                ],
                [
                    'question_text' => $question['question_text'],
                    'option_a' => $question['option_a'],
                    'option_b' => $question['option_b'],
                    'option_c' => $question['option_c'],
                    'option_d' => $question['option_d'],
                    'correct_answer' => $question['correct_answer'],
                    'quiz_id' => $quizIds[$question['quiz_title']]['quiz_id'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    private function seedLessonProgress(array $userIds, array $lessonIds): void
    {
        $now = now();

        $progress = [
            [
                'email' => 'employee@skillforge.com',
                'days_ago' => 12,
                'lessons' => [
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Why Version Control Matters'],
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Branching Strategy'],
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Pull Requests and Reviews'],
                    ['course_title' => 'Docker Essentials', 'title' => 'Containers vs Virtual Machines'],
                    ['course_title' => 'Docker Essentials', 'title' => 'Images, Containers, and Layers'],
                    ['course_title' => 'Docker Essentials', 'title' => 'Docker Compose Basics'],
                    ['course_title' => 'REST API Design', 'title' => 'Resources and Endpoints'],
                    ['course_title' => 'REST API Design', 'title' => 'HTTP Methods and Status Codes'],
                ]
            ],
            [
                'email' => 'alice@skillforge.com',
                'days_ago' => 20,
                'lessons' => [
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Why Version Control Matters'],
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Branching Strategy'],
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Pull Requests and Reviews'],
                    ['course_title' => 'Secure Coding Fundamentals', 'title' => 'Common Web Risks'],
                    ['course_title' => 'Secure Coding Fundamentals', 'title' => 'Input Validation'],
                    ['course_title' => 'Secure Coding Fundamentals', 'title' => 'Secrets and Credentials'],
                    ['course_title' => 'Docker Essentials', 'title' => 'Containers vs Virtual Machines'],
                    ['course_title' => 'Docker Essentials', 'title' => 'Images, Containers, and Layers'],
                    ['course_title' => 'Docker Essentials', 'title' => 'Docker Compose Basics'],
                    ['course_title' => 'REST API Design', 'title' => 'Resources and Endpoints'],
                    ['course_title' => 'REST API Design', 'title' => 'HTTP Methods and Status Codes'],
                    ['course_title' => 'REST API Design', 'title' => 'Validation and Error Responses'],
                    ['course_title' => 'Incident Response Basics', 'title' => 'What Counts as an Incident'],
                    ['course_title' => 'Incident Response Basics', 'title' => 'Triage and Prioritization'],
                    ['course_title' => 'Incident Response Basics', 'title' => 'Communication During Incidents'],
                ]
            ],
            [
                'email' => 'bob@skillforge.com',
                'days_ago' => 8,
                'lessons' => [
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Why Version Control Matters'],
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Branching Strategy'],
                    ['course_title' => 'Secure Coding Fundamentals', 'title' => 'Common Web Risks'],
                    ['course_title' => 'Secure Coding Fundamentals', 'title' => 'Input Validation'],
                    ['course_title' => 'Docker Essentials', 'title' => 'Containers vs Virtual Machines'],
                ]
            ],
            [
                'email' => 'carol@skillforge.com',
                'days_ago' => 5,
                'lessons' => [
                    ['course_title' => 'Incident Response Basics', 'title' => 'What Counts as an Incident'],
                ]
            ],
            [
                'email' => 'david@skillforge.com',
                'days_ago' => 3,
                'lessons' => [
                    ['course_title' => 'REST API Design', 'title' => 'Resources and Endpoints'],
                    ['course_title' => 'REST API Design', 'title' => 'HTTP Methods and Status Codes'],
                    ['course_title' => 'REST API Design', 'title' => 'Validation and Error Responses'],
                ]
            ],
            [
                'email' => 'frank@skillforge.com',
                'days_ago' => 9,
                'lessons' => [
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Why Version Control Matters'],
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Branching Strategy'],
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Pull Requests and Reviews'],
                    ['course_title' => 'Secure Coding Fundamentals', 'title' => 'Common Web Risks'],
                    ['course_title' => 'Secure Coding Fundamentals', 'title' => 'Input Validation'],
                    ['course_title' => 'Secure Coding Fundamentals', 'title' => 'Secrets and Credentials'],
                    ['course_title' => 'Incident Response Basics', 'title' => 'What Counts as an Incident'],
                    ['course_title' => 'Incident Response Basics', 'title' => 'Triage and Prioritization'],
                ]
            ],
            [
                'email' => 'grace@skillforge.com',
                'days_ago' => 6,
                'lessons' => [
                    ['course_title' => 'Docker Essentials', 'title' => 'Containers vs Virtual Machines'],
                    ['course_title' => 'Docker Essentials', 'title' => 'Images, Containers, and Layers'],
                    ['course_title' => 'REST API Design', 'title' => 'Resources and Endpoints'],
                ]
            ],
            [
                'email' => 'henry@skillforge.com',
                'days_ago' => 15,
                'lessons' => [
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Why Version Control Matters'],
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Branching Strategy'],
                    ['course_title' => 'Git & Collaboration Basics', 'title' => 'Pull Requests and Reviews'],
                    ['course_title' => 'Secure Coding Fundamentals', 'title' => 'Common Web Risks'],
                    ['course_title' => 'Secure Coding Fundamentals', 'title' => 'Input Validation'],
                    ['course_title' => 'Secure Coding Fundamentals', 'title' => 'Secrets and Credentials'],
                    ['course_title' => 'Docker Essentials', 'title' => 'Containers vs Virtual Machines'],
                    ['course_title' => 'Docker Essentials', 'title' => 'Images, Containers, and Layers'],
                    ['course_title' => 'Docker Essentials', 'title' => 'Docker Compose Basics'],
                    ['course_title' => 'Incident Response Basics', 'title' => 'What Counts as an Incident'],
                    ['course_title' => 'Incident Response Basics', 'title' => 'Triage and Prioritization'],
                ]
            ],
        ];

        foreach ($progress as $userProgress) {
            $completedAt = $now->copy()->subDays($userProgress['days_ago']);
            $userId = $userIds[$userProgress['email']];

            foreach ($userProgress['lessons'] as $lesson) {
                DB::table('lesson_progress')->updateOrInsert(
                    [
                        'user_id' => $userId,
                        'lesson_id' => $lessonIds["{$lesson['course_title']}|{$lesson['title']}"],
                    ],
                    [
                        'completed_at' => $completedAt,
                    ]
                );
            }
        }
    }

    private function seedResults(array $userIds, array $quizIds): void
    {
        $now = now();

        $results = [
            ['email' => 'employee@skillforge.com', 'quiz_title' => 'Git Workflow Quiz', 'score' => 4, 'total_questions' => 4, 'days_ago' => 11],
            ['email' => 'employee@skillforge.com', 'quiz_title' => 'Docker Concepts Quiz', 'score' => 2, 'total_questions' => 4, 'days_ago' => 10],
            ['email' => 'employee@skillforge.com', 'quiz_title' => 'Docker Concepts Quiz', 'score' => 4, 'total_questions' => 4, 'days_ago' => 9],
            ['email' => 'employee@skillforge.com', 'quiz_title' => 'REST API Quiz', 'score' => 3, 'total_questions' => 4, 'days_ago' => 2],
            ['email' => 'alice@skillforge.com', 'quiz_title' => 'Git Workflow Quiz', 'score' => 4, 'total_questions' => 4, 'days_ago' => 18],
            ['email' => 'alice@skillforge.com', 'quiz_title' => 'Secure Coding Quiz', 'score' => 4, 'total_questions' => 4, 'days_ago' => 18],
            ['email' => 'alice@skillforge.com', 'quiz_title' => 'Docker Concepts Quiz', 'score' => 4, 'total_questions' => 4, 'days_ago' => 18],
            ['email' => 'alice@skillforge.com', 'quiz_title' => 'REST API Quiz', 'score' => 4, 'total_questions' => 4, 'days_ago' => 18],
            ['email' => 'alice@skillforge.com', 'quiz_title' => 'Incident Response Quiz', 'score' => 4, 'total_questions' => 4, 'days_ago' => 18],
            ['email' => 'bob@skillforge.com', 'quiz_title' => 'Git Workflow Quiz', 'score' => 2, 'total_questions' => 4, 'days_ago' => 7],
            ['email' => 'bob@skillforge.com', 'quiz_title' => 'Git Workflow Quiz', 'score' => 4, 'total_questions' => 4, 'days_ago' => 6],
            ['email' => 'bob@skillforge.com', 'quiz_title' => 'Secure Coding Quiz', 'score' => 1, 'total_questions' => 4, 'days_ago' => 4],
            ['email' => 'carol@skillforge.com', 'quiz_title' => 'Incident Response Quiz', 'score' => 1, 'total_questions' => 4, 'days_ago' => 4],
            ['email' => 'david@skillforge.com', 'quiz_title' => 'REST API Quiz', 'score' => 4, 'total_questions' => 4, 'days_ago' => 2],
            ['email' => 'frank@skillforge.com', 'quiz_title' => 'Git Workflow Quiz', 'score' => 4, 'total_questions' => 4, 'days_ago' => 8],
            ['email' => 'frank@skillforge.com', 'quiz_title' => 'Secure Coding Quiz', 'score' => 3, 'total_questions' => 4, 'days_ago' => 7],
            ['email' => 'grace@skillforge.com', 'quiz_title' => 'Docker Concepts Quiz', 'score' => 2, 'total_questions' => 4, 'days_ago' => 5],
            ['email' => 'henry@skillforge.com', 'quiz_title' => 'Git Workflow Quiz', 'score' => 4, 'total_questions' => 4, 'days_ago' => 14],
            ['email' => 'henry@skillforge.com', 'quiz_title' => 'Secure Coding Quiz', 'score' => 4, 'total_questions' => 4, 'days_ago' => 13],
            ['email' => 'henry@skillforge.com', 'quiz_title' => 'Docker Concepts Quiz', 'score' => 3, 'total_questions' => 4, 'days_ago' => 12],
        ];

        foreach ($results as $result) {
            $quiz = $quizIds[$result['quiz_title']];
            $completedAt = $now->copy()->subDays($result['days_ago']);

            DB::table('results')->updateOrInsert(
                [
                    'user_id' => $userIds[$result['email']],
                    'quiz_id' => $quiz['quiz_id'],
                    'score' => $result['score'],
                    'total_questions' => $result['total_questions'],
                ],
                [
                    'course_id' => $quiz['course_id'],
                    'completed_at' => $completedAt,
                ]
            );
        }
    }

    private function seedCourseAssignments(array $userIds, array $courseIds): void
    {
        $now = now();
        $adminId = $userIds['admin@skillforge.com'];

        $assignments = [
            ['email' => 'employee@skillforge.com', 'course_title' => 'Git & Collaboration Basics', 'days_ago' => 16, 'due_in_days' => 7],
            ['email' => 'employee@skillforge.com', 'course_title' => 'Docker Essentials', 'days_ago' => 15, 'due_in_days' => 10],
            ['email' => 'alice@skillforge.com', 'course_title' => 'REST API Design', 'days_ago' => 24, 'due_in_days' => 7],
            ['email' => 'bob@skillforge.com', 'course_title' => 'Secure Coding Fundamentals', 'days_ago' => 12, 'due_in_days' => 5],
            ['email' => 'carol@skillforge.com', 'course_title' => 'Incident Response Basics', 'days_ago' => 8, 'due_in_days' => 3],
            ['email' => 'david@skillforge.com', 'course_title' => 'REST API Design', 'days_ago' => 6, 'due_in_days' => 8],
            ['email' => 'frank@skillforge.com', 'course_title' => 'Git & Collaboration Basics', 'days_ago' => 11, 'due_in_days' => 6],
            ['email' => 'frank@skillforge.com', 'course_title' => 'Secure Coding Fundamentals', 'days_ago' => 10, 'due_in_days' => 7],
            ['email' => 'grace@skillforge.com', 'course_title' => 'Docker Essentials', 'days_ago' => 9, 'due_in_days' => 6],
            ['email' => 'henry@skillforge.com', 'course_title' => 'Git & Collaboration Basics', 'days_ago' => 18, 'due_in_days' => 5],
            ['email' => 'henry@skillforge.com', 'course_title' => 'Secure Coding Fundamentals', 'days_ago' => 17, 'due_in_days' => 5],
        ];

        foreach ($assignments as $assignment) {
            $assignedAt = $now->copy()->subDays($assignment['days_ago']);
            $completedAt = DB::table('results')
                ->where('user_id', $userIds[$assignment['email']])
                ->where('course_id', $courseIds[$assignment['course_title']])
                ->min('completed_at');

            DB::table('course_assignments')->updateOrInsert(
                [
                    'user_id' => $userIds[$assignment['email']],
                    'course_id' => $courseIds[$assignment['course_title']],
                ],
                [
                    'assigned_by' => $adminId,
                    'due_at' => $assignedAt->copy()->addDays($assignment['due_in_days']),
                    'assigned_at' => $assignedAt,
                    'notification_sent_at' => $assignedAt,
                    'completed_at' => $completedAt,
                    'created_at' => $assignedAt,
                    'updated_at' => $now,
                ]
            );
        }
    }
}