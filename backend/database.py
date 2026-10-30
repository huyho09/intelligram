import sqlite3
import bcrypt

def init_db():
    """Initializes the database and creates the user table."""
    conn = sqlite3.connect('user_data.db')
    cursor = conn.cursor()

    # Create the users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    # Create the chat history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create the UML diagram history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS uml_diagram_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            puml_code TEXT NOT NULL,
            diagram_path TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')


    conn.commit()
    conn.close()

def add_user(username, password):
    """Adds a new user to the database with a hashed password."""
    conn = sqlite3.connect('user_data.db')
    cursor = conn.cursor()

    # Hash the password before storing it
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_password))
        conn.commit()
        print(f"User {username} added successfully.")
    except sqlite3.IntegrityError:
        print(f"Error: Username {username} already exists.")
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()
    # Example of adding a new user
    add_user('test@example.com', 'password123')