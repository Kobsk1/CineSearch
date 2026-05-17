-- ============================================================
--  CineSearch Database Schema
--  Run this in phpMyAdmin or MySQL CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS cinesearch_db;
USE cinesearch_db;

-- ── 1. USERS ────────────────────────────────────────────────
CREATE TABLE Users (
    user_id     INT(6)       NOT NULL AUTO_INCREMENT,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,          -- bcrypt hash
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

-- ── 2. FAVORITES ────────────────────────────────────────────
CREATE TABLE Favorites (
    favorite_id   INT(6)       NOT NULL AUTO_INCREMENT,
    user_id       INT(6)       NOT NULL,
    tmdb_movie_id INT(10)      NOT NULL,
    movie_title   VARCHAR(255) NOT NULL,
    poster_path   VARCHAR(255),
    saved_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (favorite_id),
    UNIQUE KEY uq_user_movie (user_id, tmdb_movie_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ── 3. RATINGS ──────────────────────────────────────────────
CREATE TABLE Ratings (
    rating_id     INT(6)       NOT NULL AUTO_INCREMENT,
    user_id       INT(6)       NOT NULL,
    tmdb_movie_id INT(10)      NOT NULL,
    movie_title   VARCHAR(255) NOT NULL,
    rating        TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 10),
    rated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (rating_id),
    UNIQUE KEY uq_user_rating (user_id, tmdb_movie_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ── 4. COMMENTS ─────────────────────────────────────────────
CREATE TABLE Comments (
    comment_id    INT(6)       NOT NULL AUTO_INCREMENT,
    user_id       INT(6)       NOT NULL,
    tmdb_movie_id INT(10)      NOT NULL,
    movie_title   VARCHAR(255) NOT NULL,
    comment_text  TEXT         NOT NULL,
    posted_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);