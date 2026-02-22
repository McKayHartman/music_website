import pg from "pg";
const { Pool } = pg;
import dotenv from 'dotenv';
	
dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

export const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: String(process.env.DB_PASS),
	database: process.env.DB_NAME,
	port: process.env.DB_PORT
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch((err) => console.error('Error connecting to PostgreSQL database:', err));

const result = await pool.query('SELECT current_user, current_database();');
console.log(result.rows);