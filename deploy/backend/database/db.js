import pg from "pg";
const { Pool } = pg;


export const pool = new Pool({
	host: "localhost",
	user: "annie",
	password: "1234",
	database: "music_dev",
	port: 5000
});