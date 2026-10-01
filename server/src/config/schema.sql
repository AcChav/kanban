-- server/src/config/schema.sql

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255)
);

-- 2. Sprints Table
CREATE TABLE IF NOT EXISTS sprints (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    sprint_id INT NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')),
    assigned_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast ordering and filtering per column in the kanban board
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_status_pos 
    ON tasks (sprint_id, status, position);

-- 4. Seed Initial Development Data
INSERT INTO users (name, avatar_url) VALUES 
('Alex Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'),
('Maria Santos', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria');

INSERT INTO sprints (title, start_date, end_date, is_active) VALUES 
('Sprint 1 - Local MVP', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', true);

INSERT INTO tasks (sprint_id, title, description, status, assigned_user_id, position) VALUES 
(1, 'Set up Docker Compose environment', 'Run Postgres with persistent data volume mounted.', 'DONE', 1, 0),
(1, 'Build Node.js Express REST API', 'Implement task update and reordering endpoints.', 'IN_PROGRESS', 2, 0),
(1, 'Implement HTML5 Drag and Drop UI', 'Handle column drops and optimistic reordering.', 'TODO', 1, 0),
(1, 'Add User Assignment Modal', 'Allow selecting team members per task card.', 'TODO', 2, 1);