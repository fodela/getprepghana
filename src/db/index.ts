import { Database } from "bun:sqlite";

const db = new Database("prepghana.sqlite", { create: true });

export default db;
