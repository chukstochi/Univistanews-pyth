-- Reference only. You do NOT need to run this by hand —
-- `flask db upgrade` (Flask-Migrate) creates these tables for you.
-- Kept here so you can see the structure at a glance.

CREATE DATABASE IF NOT EXISTS univista_news CHARACTER SET utf8mb4;
USE univista_news;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'author',   -- 'admin' or 'author'
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at DATETIME
);

CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) UNIQUE NOT NULL,
  slug VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  summary VARCHAR(500),
  body TEXT NOT NULL,
  image_url VARCHAR(500),
  is_breaking BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  category_id INT NOT NULL,
  author_id INT NOT NULL,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE news_tags (
  news_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (news_id, tag_id),
  FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
