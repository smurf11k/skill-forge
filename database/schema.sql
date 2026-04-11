CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100)        NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    password   VARCHAR(255)        NOT NULL,
    role       VARCHAR(20)         NOT NULL DEFAULT 'employee'
        CHECK (role IN ('employee', 'admin')),
    created_at TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id             BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id   BIGINT       NOT NULL,
    name           VARCHAR(255) NOT NULL,
    token          VARCHAR(64)  UNIQUE NOT NULL,
    abilities      TEXT,
    last_used_at   TIMESTAMP    NULL,
    expires_at     TIMESTAMP    NULL,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_index
    ON personal_access_tokens (tokenable_type, tokenable_id);

CREATE TABLE IF NOT EXISTS courses (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    status      VARCHAR(20)  NOT NULL DEFAULT 'published'
        CHECK (status IN ('published', 'draft')),
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
    id           BIGSERIAL PRIMARY KEY,
    course_id    BIGINT       NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL,
    content      TEXT,
    order_number INT          DEFAULT 0,
    status       VARCHAR(20)  NOT NULL DEFAULT 'published'
        CHECK (status IN ('published', 'draft')),
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id    BIGINT    NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS quizzes (
    id           BIGSERIAL PRIMARY KEY,
    course_id    BIGINT       NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL,
    order_number INT          DEFAULT 0,
    status       VARCHAR(20)  NOT NULL DEFAULT 'published'
        CHECK (status IN ('published', 'draft')),
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id             BIGSERIAL PRIMARY KEY,
    quiz_id        BIGINT       NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text  TEXT         NOT NULL,
    option_a       VARCHAR(255),
    option_b       VARCHAR(255),
    option_c       VARCHAR(255),
    option_d       VARCHAR(255),
    correct_answer VARCHAR(1)   NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
    order_number   INT          DEFAULT 0,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS results (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id       BIGINT    NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    quiz_id         BIGINT    REFERENCES quizzes(id) ON DELETE SET NULL,
    score           INT       NOT NULL,
    total_questions INT       NOT NULL,
    completed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_lessons_course_id
    ON lessons(course_id);

CREATE INDEX IF NOT EXISTS idx_quizzes_course_id
    ON quizzes(course_id);

CREATE INDEX IF NOT EXISTS idx_questions_quiz_id
    ON questions(quiz_id);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id
    ON lesson_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id
    ON lesson_progress(lesson_id);

CREATE INDEX IF NOT EXISTS idx_results_user_id
    ON results(user_id);

CREATE INDEX IF NOT EXISTS idx_results_course_id
    ON results(course_id);

CREATE INDEX IF NOT EXISTS idx_results_quiz_id
    ON results(quiz_id);

-- Seed default users (passwords are bcrypt hashed)
INSERT INTO users (name, email, password, role)
VALUES (
    'Admin',
    'admin@skillforge.com',
    '$2y$12$yOcW.WtO8OsP1zDMZ/oJ4OQPt6b.NW3k2gXbWuegMF4.4OuCFeB9.',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password, role)
VALUES (
    'Test Employee',
    'employee@skillforge.com',
    '$2y$12$P1XthtqDE8re3nXTAo0tqu/GFFs7fBeLFANg257OtcTwVTj1PpBYy',
    'employee'
)
ON CONFLICT (email) DO NOTHING;