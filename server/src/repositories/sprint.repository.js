import { pool } from "../config/db.js";

export const SprintRepository = {
  // Fetch all sprints with computed task metrics
  async getAll() {
    const query = `
      SELECT 
        s.id,
        s.name,
        s.goal,
        s.start_date,
        s.end_date,
        s.created_at,
        COUNT(t.id)::int AS total_tasks,
        COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::int AS completed_tasks
      FROM sprints s
      LEFT JOIN tasks t ON s.id = t.sprint_id
      GROUP BY s.id
      ORDER BY s.id ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getById(id) {
    const query = `SELECT * FROM sprints WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async create({ name, goal, startDate, endDate }) {
    const query = `
      INSERT INTO sprints (name, goal, start_date, end_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      name,
      goal || null,
      startDate || null,
      endDate || null,
    ]);
    return rows[0];
  },

  async update(id, { name, goal, startDate, endDate }) {
    const query = `
      UPDATE sprints
      SET 
        name = COALESCE($1, name),
        goal = COALESCE($2, goal),
        start_date = COALESCE($3, start_date),
        end_date = COALESCE($4, end_date)
      WHERE id = $5
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      name,
      goal,
      startDate,
      endDate,
      id,
    ]);
    return rows[0];
  },

  // Delete a sprint and all associated tasks in a transaction
  async delete(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM tasks WHERE sprint_id = $1;", [id]);
      const res = await client.query(
        "DELETE FROM sprints WHERE id = $1 RETURNING id;",
        [id],
      );
      await client.query("COMMIT");
      return res.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
