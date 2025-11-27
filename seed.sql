CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES admin_users(id)
);

CREATE TABLE upload_sessions (
    id VARCHAR(36) PRIMARY KEY,
    token_id INTEGER REFERENCES api_tokens(id),
    total_records INTEGER,
    valid_records INTEGER,
    duplicate_records INTEGER,
    lots_count INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'completed'
);

CREATE TABLE lots (
    id SERIAL PRIMARY KEY,
    lot_number VARCHAR(100) NOT NULL,
    upload_session_id VARCHAR(36) REFERENCES upload_sessions(id),
    record_count INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE qr_identifiers (
    id BIGSERIAL PRIMARY KEY,
    qr_id VARCHAR(255) UNIQUE NOT NULL,
    qr_text_hash VARCHAR(64) UNIQUE NOT NULL,
    lot_number VARCHAR(100) NOT NULL,
    upload_session_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_users (username, hashed_password, created_at)
VALUES ('admin', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', NOW());

INSERT INTO api_tokens (token, name, is_active, created_at, created_by)
VALUES ('sample_token_123', 'Admin Token', TRUE, NOW(), 1);
