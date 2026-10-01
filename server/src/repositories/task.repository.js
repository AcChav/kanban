import { pool } from "../config/db.js";

export const TaskRepository = {
  // Fetch all tasks for an active sprint, joined with assignee information
  async getBySprint(sprintId) {
    const query = `
      SELECT 
        t.id,
        t.sprint_id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.position,
        t.assigned_user_id,
        u.name AS assignee_name,
        u.avatar_url AS assignee_avatar
      FROM tasks t
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE t.sprint_id = $1
      ORDER BY t.position ASC;
    `;
    const { rows } = await pool.query(query, [sprintId]);
    return rows;
  },

  // Atomic reorder transaction for drag-and-drop
  async updateTaskPosition({ taskId, targetStatus, targetPosition }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Shift existing tasks in the target column down
      await client.query(
        `UPDATE tasks 
         SET position = position + 1 
         WHERE status = $1 AND position >= $2`,
        [targetStatus, targetPosition],
      );

      // Move dragged task into target status and position
      const updateQuery = `
        UPDATE tasks 
        SET status = $1, position = $2, updated_at = NOW() 
        WHERE id = $3 
        RETURNING *;
      `;
      const { rows } = await client.query(updateQuery, [
        targetStatus,
        targetPosition,
        taskId,
      ]);

      await client.query("COMMIT");
      return rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // Assign or unassign a user
  async assignUser(taskId, userId) {
    const query = `
      UPDATE tasks 
      SET assigned_user_id = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId, taskId]);
    return rows[0];
  },

  // Fetch users to populate assignee select options
  async getAllUsers() {
    const { rows } = await pool.query(
      "SELECT id, name, avatar_url FROM users ORDER BY name ASC",
    );
    return rows;
  },

  // Create a new task within a sprint
  async create({
    sprintId,
    title,
    description,
    status = "TODO",
    priority = "MEDIUM",
    assignedUserId = null,
  }) {
    const posRes = await pool.query(
      "SELECT COALESCE(MAX(position) + 1, 0) AS next_pos FROM tasks WHERE sprint_id = $1 AND status = $2",
      [sprintId, status],
    );
    const nextPosition = posRes.rows[0].next_pos;

    const query = `
      INSERT INTO tasks (sprint_id, title, description, status, priority, position, assigned_user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      sprintId,
      title,
      description || null,
      status,
      priority,
      nextPosition,
      assignedUserId || null,
    ]);

    const createdTask = rows[0];
    if (createdTask.assigned_user_id) {
      const userRes = await pool.query(
        "SELECT name, avatar_url FROM users WHERE id = $1",
        [createdTask.assigned_user_id],
      );
      if (userRes.rows.length > 0) {
        createdTask.assignee_name = userRes.rows[0].name;
        createdTask.assignee_avatar = userRes.rows[0].avatar_url;
      }
    }
    return createdTask;
  },

  // Create a new team member
  async createUser({ name, avatarUrl }) {
    // Generate a default Dicebear avatar if none is provided
    const avatar =
      avatarUrl ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    const query = `
      INSERT INTO users (name, avatar_url)
      VALUES ($1, $2)
      RETURNING id, name, avatar_url;
    `;
    const { rows } = await pool.query(query, [name, avatar]);
    return rows[0];
  },

  // Delete a task and reorder sibling tasks
  async delete(taskId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Fetch task status and position before deletion
      const taskRes = await client.query(
        "SELECT sprint_id, status, position FROM tasks WHERE id = $1",
        [taskId],
      );
      if (taskRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }
      const { sprint_id, status, position } = taskRes.rows[0];

      // Delete the target task
      await client.query("DELETE FROM tasks WHERE id = $1", [taskId]);

      // Shift higher positions down by 1 to close the gap
      await client.query(
        `UPDATE tasks 
         SET position = position - 1 
         WHERE sprint_id = $1 AND status = $2 AND position > $3`,
        [sprint_id, status, position],
      );

      await client.query("COMMIT");
      return true;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // Update task details (title, description)
  async updateDetails(taskId, { title, description, priority }) {
    const query = `
      UPDATE tasks 
      SET title = COALESCE($1, title), 
          description = COALESCE($2, description), 
          priority = COALESCE($3, priority),
          updated_at = NOW() 
      WHERE id = $4 
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      title,
      description,
      priority,
      taskId,
    ]);
    return rows[0];
  },

  // Update a team member's name
  async updateUser(userId, name) {
    const query = `
      UPDATE users 
      SET name = $1 
      WHERE id = $2 
      RETURNING id, name, avatar_url;
    `;
    const { rows } = await pool.query(query, [name, userId]);
    return rows[0];
  },

  // Delete a team member (tasks assigned to them will have assigned_user_id set to NULL due to ON DELETE SET NULL)
  async deleteUser(userId) {
    const query = `DELETE FROM users WHERE id = $1 RETURNING id;`;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  },
};
