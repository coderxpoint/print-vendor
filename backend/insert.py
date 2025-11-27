import sqlite3
from datetime import datetime

# Use a context manager to handle the connection
with sqlite3.connect('data.db') as conn:
    cursor = conn.cursor()

    # Create the admin_users table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TIMESTAMP
        )
    ''')

    # Insert data into the admin_users table
    cursor.execute('''
        INSERT INTO admin_users (username, hashed_password, created_at)
        VALUES (?, ?, ?)
    ''', ('admin', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', datetime.now()))

    # Commit the transaction
    conn.commit()
