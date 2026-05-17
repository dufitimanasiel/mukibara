-- MukibaraConnect Database Schema
-- PostgreSQL

CREATE DATABASE mukibara_connect;

\c mukibara_connect;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'manager')) DEFAULT 'manager',
  status VARCHAR(10) NOT NULL CHECK (status IN ('active', 'hidden')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  image VARCHAR(500),
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(10) NOT NULL CHECK (status IN ('active', 'hidden')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Citizen PINs table
CREATE TABLE IF NOT EXISTS citizen_pins (
  id SERIAL PRIMARY KEY,
  pin_code VARCHAR(20) NOT NULL UNIQUE,
  status VARCHAR(10) NOT NULL CHECK (status IN ('active', 'hidden')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
  id SERIAL PRIMARY KEY,
  visitor_type VARCHAR(10) NOT NULL CHECK (visitor_type IN ('admin', 'manager', 'citizen')),
  visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_announcements_created_by ON announcements(created_by);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_citizen_pins_status ON citizen_pins(status);
CREATE INDEX idx_visits_visitor_type ON visits(visitor_type);
