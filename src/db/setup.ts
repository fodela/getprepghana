import db from "./index";

console.log("Setting up database...");

// Create Facilities Table
db.run(`
  CREATE TABLE IF NOT EXISTS facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    region_id TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    address TEXT,
    phone TEXT
  )
`);

// Create Contact People Table
db.run(`
  CREATE TABLE IF NOT EXISTS contact_people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    phone_number TEXT,
    FOREIGN KEY(facility_id) REFERENCES facilities(id)
  )
`);

// Create Drug Stocks Table
db.run(`
  CREATE TABLE IF NOT EXISTS drug_stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL,
    drug_name TEXT NOT NULL,
    status TEXT CHECK(status IN ('available', 'low', 'out')) NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(facility_id) REFERENCES facilities(id)
  )
`);

console.log("Database setup complete.");
