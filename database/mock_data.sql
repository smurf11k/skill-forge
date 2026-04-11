-- =========================================================
-- MOCK USERS
-- =========================================================

-- Password note:
-- Replace this hash with a known bcrypt hash if needed.
-- Example intended plain password for all mock employees:
-- mock123
--
-- Generate with Laravel tinker:
-- Hash::make('mock123')

INSERT INTO users (name, email, password, role)
SELECT 'Alice Johnson', 'alice@skillforge.com', '$2y$12$8WBAZO/HRzwl5VYvOy1wP.LOrj0SdoG9iTgSDlpgILwKnJ2kTWShy', 'employee'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'alice@skillforge.com');

INSERT INTO users (name, email, password, role)
SELECT 'Bob Smith', 'bob@skillforge.com', '$2y$12$8WBAZO/HRzwl5VYvOy1wP.LOrj0SdoG9iTgSDlpgILwKnJ2kTWShy', 'employee'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bob@skillforge.com');

INSERT INTO users (name, email, password, role)
SELECT 'Carol White', 'carol@skillforge.com', '$2y$12$8WBAZO/HRzwl5VYvOy1wP.LOrj0SdoG9iTgSDlpgILwKnJ2kTWShy', 'employee'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'carol@skillforge.com');

INSERT INTO users (name, email, password, role)
SELECT 'David Brown', 'david@skillforge.com', '$2y$12$8WBAZO/HRzwl5VYvOy1wP.LOrj0SdoG9iTgSDlpgILwKnJ2kTWShy', 'employee'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'david@skillforge.com');

INSERT INTO users (name, email, password, role)
SELECT 'Eva Green', 'eva@skillforge.com', '$2y$12$8WBAZO/HRzwl5VYvOy1wP.LOrj0SdoG9iTgSDlpgILwKnJ2kTWShy', 'employee'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'eva@skillforge.com');

INSERT INTO users (name, email, password, role)
SELECT 'Frank Miller', 'frank@skillforge.com', '$2y$12$8WBAZO/HRzwl5VYvOy1wP.LOrj0SdoG9iTgSDlpgILwKnJ2kTWShy', 'employee'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'frank@skillforge.com');

INSERT INTO users (name, email, password, role)
SELECT 'Grace Lee', 'grace@skillforge.com', '$2y$12$8WBAZO/HRzwl5VYvOy1wP.LOrj0SdoG9iTgSDlpgILwKnJ2kTWShy', 'employee'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'grace@skillforge.com');

INSERT INTO users (name, email, password, role)
SELECT 'Henry Walker', 'henry@skillforge.com', '$2y$12$8WBAZO/HRzwl5VYvOy1wP.LOrj0SdoG9iTgSDlpgILwKnJ2kTWShy', 'employee'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'henry@skillforge.com');

-- =========================================================
-- COURSES
-- =========================================================

INSERT INTO courses (title, description, status, created_at, updated_at)
SELECT
  'Git & Collaboration Basics',
  'Core team workflow for branching, commit hygiene, pull requests, and code review etiquette.',
  'published',
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Git & Collaboration Basics');

INSERT INTO courses (title, description, status, created_at, updated_at)
SELECT
  'Secure Coding Fundamentals',
  'Introduction to common application security risks and everyday secure development habits.',
  'published',
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Secure Coding Fundamentals');

INSERT INTO courses (title, description, status, created_at, updated_at)
SELECT
  'Docker Essentials',
  'Practical container basics for local development and service-based applications.',
  'published',
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Docker Essentials');

INSERT INTO courses (title, description, status, created_at, updated_at)
SELECT
  'REST API Design',
  'Designing clean resource-based APIs, request validation, and response consistency.',
  'published',
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'REST API Design');

INSERT INTO courses (title, description, status, created_at, updated_at)
SELECT
  'Incident Response Basics',
  'How engineers react to production incidents, triage problems, and communicate clearly.',
  'published',
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Incident Response Basics');

INSERT INTO courses (title, description, status, created_at, updated_at)
SELECT
  'Frontend Accessibility Draft',
  'Draft-only course for accessibility improvements and inclusive UI patterns.',
  'draft',
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Frontend Accessibility Draft');

-- =========================================================
-- LESSONS
-- =========================================================

-- Git & Collaboration Basics
INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Why Version Control Matters',
'Version control lets a team track changes, collaborate safely, and recover from mistakes. In real projects it also supports review, accountability, and parallel work.',
0, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Git & Collaboration Basics'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Why Version Control Matters'
);

INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Branching Strategy',
'Teams often use feature branches, short-lived work branches, and protected main branches. A clear branch strategy reduces conflicts and release risk.',
1, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Git & Collaboration Basics'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Branching Strategy'
);

INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Pull Requests and Reviews',
'Pull requests are a checkpoint for code quality, shared understanding, and risk reduction. Good reviews are constructive, specific, and timely.',
3, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Git & Collaboration Basics'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Pull Requests and Reviews'
);

-- Secure Coding Fundamentals
INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Common Web Risks',
'Engineers should recognize common risks such as injection, broken access control, insecure secrets handling, and unsafe input assumptions.',
0, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Secure Coding Fundamentals'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Common Web Risks'
);

INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Input Validation',
'Validation should happen server-side for all untrusted input. Validation and authorization solve different problems and should not be confused.',
1, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Secure Coding Fundamentals'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Input Validation'
);

INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Secrets and Credentials',
'Credentials should never be hardcoded in source code. Use environment variables, secret managers, and rotation practices.',
3, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Secure Coding Fundamentals'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Secrets and Credentials'
);

-- Docker Essentials
INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Containers vs Virtual Machines',
'Containers share the host kernel and are lighter than virtual machines. They are useful for portability and consistent local environments.',
0, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Docker Essentials'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Containers vs Virtual Machines'
);

INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Images, Containers, and Layers',
'Images are built from layers, and containers are runnable instances of images. Layered builds improve caching and reuse.',
1, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Docker Essentials'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Images, Containers, and Layers'
);

INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Docker Compose Basics',
'Compose helps define multi-service setups with shared networking, volumes, and environment configuration for development.',
3, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Docker Essentials'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Docker Compose Basics'
);

-- REST API Design
INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Resources and Endpoints',
'REST APIs should model domain resources clearly. Endpoint design should be predictable and consistent across the application.',
0, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'REST API Design'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Resources and Endpoints'
);

INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'HTTP Methods and Status Codes',
'Use HTTP methods according to intent and return clear status codes so clients can reason about success and failure accurately.',
1, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'REST API Design'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'HTTP Methods and Status Codes'
);

INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Validation and Error Responses',
'Validation errors should be structured, readable, and consistent. Clients benefit from predictable response formats.',
3, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'REST API Design'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Validation and Error Responses'
);

-- Incident Response Basics
INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'What Counts as an Incident',
'Incidents include service outages, severe degradations, data exposure risks, and other production issues affecting users or business operations.',
0, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Incident Response Basics'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'What Counts as an Incident'
);

INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Triage and Prioritization',
'Early incident handling focuses on severity, blast radius, time sensitivity, and user impact. Clear prioritization reduces chaos.',
1, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Incident Response Basics'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Triage and Prioritization'
);

INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Communication During Incidents',
'Clear updates reduce confusion. Internal and external communication should be factual, timely, and calm.',
3, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Incident Response Basics'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Communication During Incidents'
);

-- Draft course lessons
INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Semantic HTML Basics',
'Use semantic structure to improve accessibility, navigation, and assistive technology support.',
0, 'draft', NOW(), NOW()
FROM courses c
WHERE c.title = 'Frontend Accessibility Draft'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Semantic HTML Basics'
);

INSERT INTO lessons (course_id, title, content, order_number, status, created_at, updated_at)
SELECT c.id, 'Keyboard Navigation',
'Interfaces should remain usable without a mouse and should provide visible focus states.',
1, 'draft', NOW(), NOW()
FROM courses c
WHERE c.title = 'Frontend Accessibility Draft'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Keyboard Navigation'
);

-- =========================================================
-- QUIZZES
-- =========================================================

INSERT INTO quizzes (course_id, title, order_number, status, created_at, updated_at)
SELECT c.id, 'Git Workflow Quiz', 2, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Git & Collaboration Basics'
AND NOT EXISTS (
  SELECT 1 FROM quizzes q WHERE q.course_id = c.id AND q.title = 'Git Workflow Quiz'
);

INSERT INTO quizzes (course_id, title, order_number, status, created_at, updated_at)
SELECT c.id, 'Secure Coding Quiz', 2, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Secure Coding Fundamentals'
AND NOT EXISTS (
  SELECT 1 FROM quizzes q WHERE q.course_id = c.id AND q.title = 'Secure Coding Quiz'
);

INSERT INTO quizzes (course_id, title, order_number, status, created_at, updated_at)
SELECT c.id, 'Docker Concepts Quiz', 2, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Docker Essentials'
AND NOT EXISTS (
  SELECT 1 FROM quizzes q WHERE q.course_id = c.id AND q.title = 'Docker Concepts Quiz'
);

INSERT INTO quizzes (course_id, title, order_number, status, created_at, updated_at)
SELECT c.id, 'REST API Quiz', 2, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'REST API Design'
AND NOT EXISTS (
  SELECT 1 FROM quizzes q WHERE q.course_id = c.id AND q.title = 'REST API Quiz'
);

INSERT INTO quizzes (course_id, title, order_number, status, created_at, updated_at)
SELECT c.id, 'Incident Response Quiz', 2, 'published', NOW(), NOW()
FROM courses c
WHERE c.title = 'Incident Response Basics'
AND NOT EXISTS (
  SELECT 1 FROM quizzes q WHERE q.course_id = c.id AND q.title = 'Incident Response Quiz'
);

INSERT INTO quizzes (course_id, title, order_number, status, created_at, updated_at)
SELECT c.id, 'Accessibility Basics Quiz', 2, 'draft', NOW(), NOW()
FROM courses c
WHERE c.title = 'Frontend Accessibility Draft'
AND NOT EXISTS (
  SELECT 1 FROM quizzes q WHERE q.course_id = c.id AND q.title = 'Accessibility Basics Quiz'
);

-- =========================================================
-- QUESTIONS
-- =========================================================

-- Git Workflow Quiz
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'What is the main purpose of a pull request?', 'To rename a branch', 'To review and discuss code before merge', 'To delete old commits', 'To restart the repository', 'b', 0, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Git Workflow Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 0
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'Why use short-lived feature branches?', 'To avoid all testing', 'To reduce merge complexity and keep work isolated', 'To remove commit history', 'To replace code review', 'b', 1, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Git Workflow Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 1
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'What is a good code review practice?', 'Ignore context and approve quickly', 'Comment only on formatting', 'Give specific, constructive feedback', 'Merge before reading', 'c', 2, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Git Workflow Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 2
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'What does version control help with?', 'Tracking changes over time', 'Cooking recipes', 'Replacing documentation', 'Removing collaboration', 'a', 3, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Git Workflow Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 3
);

-- Secure Coding Quiz
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'Where should validation always happen?', 'Only in the browser', 'Only in documentation', 'On the server side', 'Inside CSS', 'c', 0, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Secure Coding Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 0
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'Which is a bad practice?', 'Using environment variables', 'Hardcoding secrets in code', 'Validating input', 'Restricting access', 'b', 1, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Secure Coding Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 1
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'What does authorization answer?', 'Is the input formatted correctly?', 'Is the user allowed to do this?', 'Did the UI render?', 'Is the password hashed?', 'b', 2, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Secure Coding Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 2
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'Which risk category is common in web apps?', 'Broken access control', 'Printer overheating', 'Slow typing speed', 'Audio distortion', 'a', 3, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Secure Coding Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 3
);

-- Docker Concepts Quiz
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'What is a container?', 'A physical server', 'A runnable instance of an image', 'A package registry', 'A VM hypervisor', 'b', 0, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Docker Concepts Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 0
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'Why are image layers useful?', 'They reduce readability', 'They improve caching and reuse', 'They replace networking', 'They store passwords in plain text', 'b', 1, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Docker Concepts Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 1
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'What does Docker Compose help with?', 'Writing CSS', 'Running multiple services together', 'Replacing source control', 'Editing database rows manually', 'b', 2, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Docker Concepts Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 2
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'Containers are generally...', 'Heavier than virtual machines in typical dev workflows', 'Lighter than full virtual machines', 'Unrelated to deployment consistency', 'Only usable in production', 'b', 3, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Docker Concepts Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 3
);

-- REST API Quiz
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'What should REST endpoints usually model?', 'Random UI components', 'Database backups only', 'Domain resources', 'CSS classes', 'c', 0, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'REST API Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 0
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'Why are consistent error responses useful?', 'They make debugging harder', 'They help clients handle failures predictably', 'They remove validation needs', 'They replace documentation entirely', 'b', 1, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'REST API Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 1
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'Which HTTP method is commonly used for creating resources?', 'GET', 'POST', 'TRACE', 'HEAD', 'b', 2, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'REST API Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 2
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'What should status codes communicate?', 'Only frontend theme preference', 'Whether the server likes the request', 'The outcome category of the request', 'Database table size', 'c', 3, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'REST API Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 3
);

-- Incident Response Quiz
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'What is triage during an incident?', 'Designing a logo', 'Prioritizing and assessing the issue', 'Renaming the app', 'Deleting logs', 'b', 0, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Incident Response Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 0
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'Which factor matters early in an incident?', 'Font choice', 'Blast radius', 'Preferred editor theme', 'Whitespace style', 'b', 1, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Incident Response Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 1
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'Good incident communication should be...', 'Vague and delayed', 'Calm, factual, and timely', 'Private to one engineer only', 'Based on guesses', 'b', 2, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Incident Response Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 2
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'Which is an example of an incident?', 'A severe production outage', 'A renamed local branch', 'A typo in a private note', 'A dark mode preference change', 'a', 3, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Incident Response Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 3
);

-- Draft quiz questions
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_number, created_at, updated_at)
SELECT q.id, 'Why is semantic HTML useful?', 'Only for styling', 'It improves accessibility and structure', 'It removes the need for JavaScript', 'It replaces routing', 'b', 0, NOW(), NOW()
FROM quizzes q
WHERE q.title = 'Accessibility Basics Quiz'
AND NOT EXISTS (
  SELECT 1 FROM questions qq WHERE qq.quiz_id = q.id AND qq.order_number = 0
);

-- =========================================================
-- LESSON PROGRESS
-- =========================================================

-- Helper note:
-- employee@skillforge.com = active user with strong progress
-- alice = completed almost everything
-- bob = mixed progress, failed some quizzes
-- carol = at risk
-- david = started one course only
-- eva = no progress
-- frank = good steady progress
-- grace = partial progress
-- henry = strong but not complete

-- employee@skillforge.com
INSERT INTO lesson_progress (user_id, lesson_id, completed_at)
SELECT u.id, l.id, NOW() - INTERVAL '12 days'
FROM users u
JOIN lessons l ON l.title IN (
  'Why Version Control Matters',
  'Branching Strategy',
  'Pull Requests and Reviews',
  'Containers vs Virtual Machines',
  'Images, Containers, and Layers',
  'Docker Compose Basics',
  'Resources and Endpoints',
  'HTTP Methods and Status Codes'
)
WHERE u.email = 'employee@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.lesson_id = l.id
);

-- alice
INSERT INTO lesson_progress (user_id, lesson_id, completed_at)
SELECT u.id, l.id, NOW() - INTERVAL '20 days'
FROM users u
JOIN lessons l ON l.status = 'published'
JOIN courses c ON c.id = l.course_id AND c.status = 'published'
WHERE u.email = 'alice@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.lesson_id = l.id
);

-- bob
INSERT INTO lesson_progress (user_id, lesson_id, completed_at)
SELECT u.id, l.id, NOW() - INTERVAL '8 days'
FROM users u
JOIN lessons l ON l.title IN (
  'Why Version Control Matters',
  'Branching Strategy',
  'Common Web Risks',
  'Input Validation',
  'Containers vs Virtual Machines'
)
WHERE u.email = 'bob@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.lesson_id = l.id
);

-- carol
INSERT INTO lesson_progress (user_id, lesson_id, completed_at)
SELECT u.id, l.id, NOW() - INTERVAL '5 days'
FROM users u
JOIN lessons l ON l.title IN ('What Counts as an Incident')
WHERE u.email = 'carol@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.lesson_id = l.id
);

-- david
INSERT INTO lesson_progress (user_id, lesson_id, completed_at)
SELECT u.id, l.id, NOW() - INTERVAL '3 days'
FROM users u
JOIN lessons l ON l.title IN (
  'Resources and Endpoints',
  'HTTP Methods and Status Codes',
  'Validation and Error Responses'
)
WHERE u.email = 'david@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.lesson_id = l.id
);

-- frank
INSERT INTO lesson_progress (user_id, lesson_id, completed_at)
SELECT u.id, l.id, NOW() - INTERVAL '9 days'
FROM users u
JOIN lessons l ON l.title IN (
  'Why Version Control Matters',
  'Branching Strategy',
  'Pull Requests and Reviews',
  'Common Web Risks',
  'Input Validation',
  'Secrets and Credentials',
  'What Counts as an Incident',
  'Triage and Prioritization'
)
WHERE u.email = 'frank@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.lesson_id = l.id
);

-- grace
INSERT INTO lesson_progress (user_id, lesson_id, completed_at)
SELECT u.id, l.id, NOW() - INTERVAL '6 days'
FROM users u
JOIN lessons l ON l.title IN (
  'Containers vs Virtual Machines',
  'Images, Containers, and Layers',
  'Resources and Endpoints'
)
WHERE u.email = 'grace@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.lesson_id = l.id
);

-- henry
INSERT INTO lesson_progress (user_id, lesson_id, completed_at)
SELECT u.id, l.id, NOW() - INTERVAL '15 days'
FROM users u
JOIN lessons l ON l.title IN (
  'Why Version Control Matters',
  'Branching Strategy',
  'Pull Requests and Reviews',
  'Common Web Risks',
  'Input Validation',
  'Secrets and Credentials',
  'Containers vs Virtual Machines',
  'Images, Containers, and Layers',
  'Docker Compose Basics',
  'What Counts as an Incident',
  'Triage and Prioritization'
)
WHERE u.email = 'henry@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.lesson_id = l.id
);

-- =========================================================
-- QUIZ RESULTS
-- =========================================================

-- employee@skillforge.com
-- passed Git, failed then passed Docker, failed REST once
INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 4, 4, NOW() - INTERVAL '11 days'
FROM users u
JOIN quizzes q ON q.title = 'Git Workflow Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'employee@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id AND r.score = 4 AND r.total_questions = 4
);

INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 2, 4, NOW() - INTERVAL '10 days'
FROM users u
JOIN quizzes q ON q.title = 'Docker Concepts Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'employee@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id AND r.score = 2 AND r.total_questions = 4
);

INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 4, 4, NOW() - INTERVAL '9 days'
FROM users u
JOIN quizzes q ON q.title = 'Docker Concepts Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'employee@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id AND r.score = 4 AND r.total_questions = 4
);

INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 3, 4, NOW() - INTERVAL '2 days'
FROM users u
JOIN quizzes q ON q.title = 'REST API Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'employee@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id AND r.score = 3 AND r.total_questions = 4
);

-- alice: completed all published quizzes perfectly
INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 4, 4, NOW() - INTERVAL '18 days'
FROM users u
JOIN quizzes q ON q.status = 'published'
JOIN courses c ON c.id = q.course_id AND c.status = 'published'
WHERE u.email = 'alice@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id AND r.score = 4 AND r.total_questions = 4
);

-- bob: mixed, one failure and one pass
INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 2, 4, NOW() - INTERVAL '7 days'
FROM users u
JOIN quizzes q ON q.title = 'Git Workflow Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'bob@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id AND r.score = 2
);

INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 4, 4, NOW() - INTERVAL '6 days'
FROM users u
JOIN quizzes q ON q.title = 'Git Workflow Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'bob@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id AND r.score = 4
);

INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 1, 4, NOW() - INTERVAL '4 days'
FROM users u
JOIN quizzes q ON q.title = 'Secure Coding Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'bob@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id AND r.score = 1
);

-- carol: at risk, failed only quiz attempt
INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 1, 4, NOW() - INTERVAL '4 days'
FROM users u
JOIN quizzes q ON q.title = 'Incident Response Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'carol@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id
);

-- david: completed one course cleanly
INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 4, 4, NOW() - INTERVAL '2 days'
FROM users u
JOIN quizzes q ON q.title = 'REST API Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'david@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id
);

-- frank: strong progress
INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 4, 4, NOW() - INTERVAL '8 days'
FROM users u
JOIN quizzes q ON q.title = 'Git Workflow Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'frank@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id
);

INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 3, 4, NOW() - INTERVAL '7 days'
FROM users u
JOIN quizzes q ON q.title = 'Secure Coding Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'frank@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id
);

-- grace: partial
INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 2, 4, NOW() - INTERVAL '5 days'
FROM users u
JOIN quizzes q ON q.title = 'Docker Concepts Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'grace@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id
);

-- henry: strong but not complete
INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 4, 4, NOW() - INTERVAL '14 days'
FROM users u
JOIN quizzes q ON q.title = 'Git Workflow Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'henry@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id
);

INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 4, 4, NOW() - INTERVAL '13 days'
FROM users u
JOIN quizzes q ON q.title = 'Secure Coding Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'henry@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id
);

INSERT INTO results (user_id, course_id, quiz_id, score, total_questions, completed_at)
SELECT u.id, c.id, q.id, 3, 4, NOW() - INTERVAL '12 days'
FROM users u
JOIN quizzes q ON q.title = 'Docker Concepts Quiz'
JOIN courses c ON c.id = q.course_id
WHERE u.email = 'henry@skillforge.com'
AND NOT EXISTS (
  SELECT 1 FROM results r WHERE r.user_id = u.id AND r.quiz_id = q.id
);