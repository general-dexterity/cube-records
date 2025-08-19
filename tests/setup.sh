#!/usr/bin/env bash

# Setup script for the e2e tests.

# Create a empty database:
duckdb ./data/data.duckdb 'SELECT 1 = 1'

# Insert sample data into the database:
duckdb ./data/data.duckdb "CREATE TABLE users AS SELECT * FROM 'seeds/users.csv'"
duckdb ./data/data.duckdb "CREATE TABLE products AS SELECT * FROM 'seeds/products.csv'"
duckdb ./data/data.duckdb "CREATE TABLE orders AS SELECT * FROM 'seeds/orders.csv'"
duckdb ./data/data.duckdb "CREATE TABLE line_items AS SELECT * FROM 'seeds/line_items.csv'"
duckdb ./data/data.duckdb "CREATE TABLE categories AS SELECT * FROM 'seeds/categories.csv'"
duckdb ./data/data.duckdb "CREATE TABLE inventory_transactions AS SELECT * FROM 'seeds/inventory_transactions.csv'"
duckdb ./data/data.duckdb "CREATE TABLE customer_reviews AS SELECT * FROM 'seeds/customer_reviews.csv'"

# Display loaded tables
echo "Loaded tables:"
duckdb ./data/data.duckdb "SHOW TABLES"
