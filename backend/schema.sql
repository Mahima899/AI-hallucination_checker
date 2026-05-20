CREATE DATABASE IF NOT EXISTS hallucination_checker;
USE hallucination_checker;

CREATE TABLE IF NOT EXISTS checks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    input_text TEXT NOT NULL,
    verdict ENUM('TRUE', 'FALSE', 'PARTIALLY TRUE') NOT NULL,
    confidence INT NOT NULL,
    explanation TEXT NOT NULL,
    corrections TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
