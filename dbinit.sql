SET sql_safe_updates = FALSE;

USE defaultdb;
DROP DATABASE IF EXISTS foodsurfer CASCADE;
CREATE DATABASE IF NOT EXISTS foodsurfer;

USE foodsurfer;

CREATE TABLE users (
    uid VARCHAR(255) PRIMARY KEY NOT NULL,
    token VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    gender VARCHAR(255) NOT NULL,
    pic VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE meals (
    mid VARCHAR(255) PRIMARY KEY NOT NULL,
    foodName VARCHAR(255) NOT NULL,
    foodImage VARCHAR(255) NOT NULL,
    openStatus BOOLEAN,
    mealHost VARCHAR(255) NOT NULL,
    description TEXT,
    startTime INT8,
    endTime INT8,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    allergies VARCHAR(255) NOT NULL
);