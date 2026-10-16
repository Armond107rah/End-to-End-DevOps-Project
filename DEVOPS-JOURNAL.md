# End-to-End DevOps Project Journal

## Project Objective
The goal of this project is to take an existing PERN-stack application and approach the way a DevOps engineer would when a repository has little or no deployment documentation.
Instead of immediately writing a CI/CD pipeline, I first inspected the application
1. Inspected the application
2. Identified its components
3. Verified how they communicate
4. Built the frontend
5. Check the production build contains the expected backend configuration

# Here's my Directive Approach

## 1. Repository Discovery
The repository was cloned locally and inspected from the terminal
```bash
'git clone https://github.com/Armond107rah/End-to-End-DevOps-Project.git'
'cd End-to-End-DevOps-Project'
'cd "PERN-stack Application"'
```
To inspect files without opening every directory manually:
```bash
find . -maxdepth 3 -type f | sort
```
This command searches from the current directory, limits the search to three levels, returns files only, and sorts results
Here are the important folders discovered:
'''plain text
PERN-stack Application/
├── Client/
├── Server/
└── Database/
```
Important files included:
'''plain text
Client/package.json
Client/Dockerfile
Client/src/App.js
Server/package.json
Server/Dockerfile
Server/server.js
Server/.env
Database/README.md
Database/pg_backup
'''
[Place image]
The frontend represents the interface, the backend handles logic and API requests, and the database stores persistent data.
## 2. Frontend Analysis
I inspected:
```bash
cat Client/package.json
```
The frontend uses React, Axios, and react-scripts.
```bash
npm start
npm run build
npm test
```

Axios is used to send HTTP requests to the backend. npm run build creates the production frontend.

## 3. Backend Analysis
I inspected:
```bash
cat Server/package.json
```
important dependencies to know:
- express runs the backend API
- pg connects Node.js to PostgreSQL
- dotenv loads environment configuration
- cors allows cross-origin requests
  
The backend package file does not currently define a normal production start script; the Dockerfile starts the backnd with PM2.
## 4. Frontend Dockerfile Analysis
I inspected:
```bash
cat Client/Dockerfile
```
The frontend uses a multi-stage Docker build. Node 18 --> npm install --> npm run build --> Nginx Alpine --> serves React build on port 80
The Dockerfile also defines:
```bash
Backend_Base_Url=http://backend:5000
```
This suggested the frontend should communicate with a backedn service named backend on port 5000.

## 5. Backend Dockerfile Analysis
I inspected:
```bash
cat Server/Dockerfile
```
The backend container:
``` plain text
Uses Node 18 Alpine
Installs dependencies
Installs PM2
Copies source code
Exposes port 5000
Starts server.js with PM2
```
The container command is:
```bash
pm2 start server.js --name Zal-App-Backend --no-daemon
```
---no-daemon keeps the main process in the foreground so the container stays running. 

## 6. Backend Source-Code Analysis
I inspected:
```bash
cat Server/server.js
```
The backend listens on: process.env.PORT || 5000
It connects to PostgreSQL through: process.env.DATABASE_URL
This means the database location and credentials can be supplied through configuration instead of hard-coded in the application.

## 7. Backend API Endpoints
The backend exposes CRUD endpoints under:
```plain text
/api/items
```
Operations:
```plain text
GET    /api/items
POST   /api/items
PUT    /api/items/:id
DELETE /api/items/:id
```
The backend works with: items_table
React sends a GET /api/items request when the user needs to view data. Express receives that request, runs the SQL query SELECT * FROM items_table, and asks PostgreSQL for the stored records. PostgreSQL returns the data to Express, which sends it back to React so the user can see it.

** Understanding this flow is essential because in DevOps, if any link breaks whether it's frontend, API, database connection the application may deploy successfully but still fail the user **

## 8. Verifying How the Frontend Calls the Backend
I searched the frontend source with:
```bash
grep -R "axios" Client
grep -R "Backend_Base_Url" Client
grep -R "/api/items" Client
```
The search confirmed that the command:
```plain text
Client/src/App.js
```
uses Axios and builds API calls from: ${process.env.Backend_Base_Url}/api/items

## 9. Frontend Production Build
```bash
npm install
npm run build
```
The build completed successfully and was ready to be deployed.
## 10. Frontend Production Build
From the Client directory I ran:
```bash
npm install
npm run build
```
The build completed successfully.
## 11. Verifying the Backend URL in the Compiled Build
I checked the production and API files with:
```bash
grep -R -o "http://backend:5000" build | head
grep -R -o "/api/items" build | head
```
Result:
```plain text
Frontend production build: PASS
Backend URL included in compiled frontend: PASS
API path included in compiled frontend: PASS
```
This proves the backend address was included in the compiled frontend. It does not yet prove a user's browser can resolve and reach the hostname backend. 

## Why Browser Networking Matters
Inside a Docker Network, services can often communicate by service name:
```plain text
frontend container
      |
      v
backend:5000
```
However, React code executes in the user's browser. A browser outside the Docker network may not know what backend means. Production systems often solve this by using https://api.example.com or a relative path: /api/items.
with Nginx or another reverse proxy forwarding requests internally. This must be tested at runtime. This is essential because it should prove in the CI/CD process did the application still after deployment?

[CI/CD chart]

## Current project Checklist

```plain text
[PASS] Repository cloned
[PASS] Repository structure inspected
[PASS] Frontend dependencies identified
[PASS] Backend dependencies identified
[PASS] Dockerfiles inspected
[PASS] Backend port confirmed
[PASS] Database environment variable identified
[PASS] API routes identified
[PASS] Frontend Axios calls located
[PASS] Frontend build completed
[PASS] Backend URL found in compiled frontend
```
