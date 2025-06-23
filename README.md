TipspromenadApp
This is a group project built in .NET (C#), React, and SQLite.

Tech Stack
Backend: .NET Web API, Entity Framework Core, SQLite

Frontend: React

API Testing: Swagger

Version Control: Git + GitHub (Organization: TipspromenadApp)

Setup
frontend/ – React client

backend/ – .NET API with database models and Swagger

To run the backend:

cd backend
dotnet run
Swagger will be available at https://localhost:[port]/swagger

Features
Week 1 – Login and Register (Janine)
Implemented:

Register endpoint (POST /register)

Saves user with Username, Email, and a hashed Password

Login endpoint (POST /login)

Verifies user by email and password using hashing

Passwords are never stored as plain text

Fully tested using Swagger

How to Test:

Go to Swagger (/swagger)

Register a new user:

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "1234"
}

Log in using the same email and password:

{
  "email": "test@example.com",
  "password": "1234"
}

Expected response:
"Login successful"
Or an unauthorized message if credentials are incorrect.

Status
Initial setup complete

User authentication implemented

Quiz model and logic coming next

Team

JayB111 (Project Lead)

Jester_Jonas

Jane_Hellberg