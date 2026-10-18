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
## Inspect the Database
The first step was to understand what database-related files already exist in the repository instead of immediately creating a new database setup.

From the PERN-stack Application directory:
```bash
cat Database/README.md
```
Then inspect the backup file type:
```bash
file Database/pg_backup
```
The goal is to avoid recreating something that already exists. Before changing anything, a DevOps engineer should first determine whetehr the repository already includes
- Database setup instructions
- SQL scripts
- Database backups
- Schema information
- Restore procedures

## 13. Inspect Backend Environment Variables
The backend source code showed that PostgreSQL is configured through DATABASE_URL
The backend uses:
```javascript
connectionString: process.env.DATABASE_URL
```
This means the application expects one complete PostgreSQL connection string. A safe way to inspect an existing .env file without exposing secrets is:
```bash
sed 's/=.*/=<redacted>/' Server/.env
```
The example of safe output:
```plain text
PORT=<redacted>
DATABASE_URL=<redacted>
```
This matters because environment variables allow the same application code to work in different environments.

PostgreSQL was not installed directly on the local machine. Instead of installing PostgreSQL permnently on the machine, Docker was used to create an isolated Database environment. This is useful in DevOps because containers make environments easier to recreate.

## 14. Start PostgreSQL with DOCKER
The database container was created with:
``bash
docker run --name pern-postgres \
  -e POSTGRES_USER=<username>\
  -e POSTGRES_PASSWORD=<password> \
  -e POSTGRES_DB= <database name>\
  -p <portnumber>:<portnumber> \
  -d postgres:16
  ```
This configuration created:
- Container: 
- Database:  
- Username:  
- Password:  
- Port:
```
## 15. Verify PostgreSQL Is Running
Check running containers:
```bssh
docker ps
```
The expected result should give you the container name. If the container stopped:
```bash
docker start <container name>
```
The backend cannot connect to PostgreSQL if the database service is not running.

## 16. Configure the Backend .env
The backend expected: 
```plain text
DATABASE_URL
```
The working local configuration was
```env
PORT=5000
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```
## Why localhost Works Here
The backend was running directly on my Mac machine. PostgreSQL was running inside Docker but exposed to the MAC through 5432:5432.
Therefore the local Node backend could reach PostgreSQL thought localhost:5432

## 17. Verify Node Can Read DATABASE_URL
A simple validation command was used:
```bash
node -e 'require("dotenv").config(); console.log(Boolean(process.env.DATABASE_URL))'
```
Expected result: true
This proves that the .env file exists, dotenv loaded it, & DATABASE_URL is available to Node

## 18. Start the Backend
From the Server directory:
```bash
node server.js
```
The successful output should give you:
```plaintext
Server running on port 5000
Connected to the database
```
The backend process running does not automatically mean the database connection works. Both the Express server and the PostgreSQL connection need to be checked.
## 19. API Runtime Test
The backend was kept running in Terminal 1.
In Terminal 2:
```bash
curl -i http://localhost:5000/api/items
```
The API returned:
```plaintext
HTTP/1.1 200 OK
```
A 200 OK confirms that the request successfully reached the Express API and the server returned a successful response. The possible results can give you:
```JSON
[]
```
or:
```JSON
[
  {
    "id": 1,
    "name": "Example",
    "description": "Example record"
  }
]
```
For API Request flow, the runtime test proved this path:
Curl --> Express API --> PostgreSQL --> Express --> HTTP response

This is essential to understand because a CI/CD pipeline should eventually verify application behavior, not only whether Docker images were built. Running a Runtime test is important before CI/CD. A deployment canappear healthy while the application is not functional. 

For Example:
```plaintext
Container running          PASS
Node process running       PASS
Database connection        FAIL
```
That is still a broken application. Runtime testing verifies the actual dependency chain. The goal is to prove that API can connect and communicate the backend and database to give a valid response before automating the process. 

## 20. Beginning CRUD Testing
After the GET runtime test succeeded, the next phase was CRUD Testing. The goal is to verify that the backend can perform all major database operations.
CRUD means:
```plaintext
CREATE = POST
READ   = GET
UPDATE = PUT
DELETE = DELETE
```
## CRUD TEST 1: CREATE-POST
Create a test record:
```bash
curl -i -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","description":"Created during API testing"}'
```
A successful response should return the newly created record. 
Example:
```JSON
{
  "id": 1,
  "name": "Test Item",
  "description": "Created during API testing"
}
```
The returned id should be saved because it will be used during UPDATE and DELETE testing.

## CRUD TEST 2: READ-GET
After POST:
```bash
curl -i http://localhost:5000/api/items
```
The created item should appear in the response. This proves that POST actually wrote data into PostgreSQL.
## THE NEXT PLANNED CRUD TESTS
UPDATE
```bash
curl -i -X PUT http://localhost:5000/api/items/<ID> \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Item","description":"Updated during CRUD testing"}'
```
DELETE
```bash
curl -i -X DELETE http://localhost:5000/api/items/<ID>
```
FINAL VERIFICATION
```bash
curl -i http://localhost:5000/api/items
```
The actual ID returned from POST should always be used.

# Current Status
```plaintext
[PASS] Database files inspected
[PASS] PostgreSQL strategy chosen
[PASS] PostgreSQL Docker container created
[PASS] Database port exposed locally
[PASS] DATABASE_URL identified
[PASS] .env created/configured
[PASS] Node confirmed DATABASE_URL exists
[PASS] Backend started
[PASS] PostgreSQL connection established
[PASS] GET /api/items returned HTTP 200
```

