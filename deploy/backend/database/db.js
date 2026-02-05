import pg from "pg";
const { Pool } = pg;
import dotenv from 'dotenv';
	
dotenv.config({ path: new URL('../.env', import.meta.url).pathname });
console.log("CWD", process.cwd());
console.log('DB_HOST', process.env.DB_HOST);
console.log('DB_PORT', process.env.DB_PORT);
console.log('DB_USER', process.env.DB_USER);
console.log('DB_PASS', process.env.DB_PASS);
console.log('DB_NAME', process.env.DB_NAME);

export const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: String(process.env.DB_PASS),
	database: process.env.DB_NAME,
	port: process.env.DB_PORT
});