-- Quick Setup Script for Health Hive Database
-- Run this file to create and setup the database in one go

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS health_hive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 2: Use the database
USE health_hive;

-- Step 3: Show confirmation message
SELECT 'Database health_hive created successfully!' AS Status;

-- Step 4: Create tables
SELECT 'Creating tables...' AS Status;

-- Symptoms table
CREATE TABLE IF NOT EXISTS symptoms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Diseases table
CREATE TABLE IF NOT EXISTS diseases (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    details TEXT,
    tests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Disease symptoms relationship table (many-to-many)
CREATE TABLE IF NOT EXISTS disease_symptoms (
    disease_id INT NOT NULL,
    symptom_id INT NOT NULL,
    PRIMARY KEY (disease_id, symptom_id),
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE,
    FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tips table
CREATE TABLE IF NOT EXISTS tips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Create indexes for better performance
CREATE INDEX idx_symptom_name ON symptoms(name);
CREATE INDEX idx_disease_name ON diseases(name);
CREATE INDEX idx_disease_symptoms_disease ON disease_symptoms(disease_id);
CREATE INDEX idx_disease_symptoms_symptom ON disease_symptoms(symptom_id);

-- Step 6: Show all tables
SELECT 'Tables created successfully!' AS Status;
SHOW TABLES;

-- Step 7: Show next steps
SELECT 'Next Step: Run "npm run migrate" to populate the database with data' AS NextStep;
