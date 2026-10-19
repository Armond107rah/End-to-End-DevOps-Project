CREATE TABLE IF NOT EXISTS items_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);
