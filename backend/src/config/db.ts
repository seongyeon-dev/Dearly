import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import "dotenv/config";

const caCertificate = process.env.DB_CA_CERT_PEM
  ? process.env.DB_CA_CERT_PEM.replace(/\\n/g, "\n")
  : fs.readFileSync(
      path.resolve(process.cwd(), process.env.DB_CA_CERT || "./certs/ca.pem"),
      "utf8",
    );

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl:
    process.env.DB_SSL === "true"
      ? {
          ca: caCertificate,
          rejectUnauthorized: true,
        }
      : undefined,

  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
