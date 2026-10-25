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

This phase moved the PERN application from a manually tested local setup into ta reproducible Docker Compose environment.

Browser --> Frontend(Nginx) --> Backend(Express) --> PostgreSQL --> Persistent Volume

The goal in DevOps is to make the environment repeatable, testable, consistent and ready for CI/CD.

# PHASE 2
## 1. Validate the Application Locally First

Before relying on Docker, the application needs to be tested locally. Here are some things that happened during testing that I should document:
The frontend loaded successfully, but the browser Network tab showed:
```plaintext
http://localhost:3000/undefined/api/items
```
This was important because it proved the page could render while the frontend-to-backend connection was still broken.
The frontend used:
```JavaScript
process.env.Backend_Base_Url
```
The project uses Create React App, so the custom browser variable was changed to:
```JavaScript
process.env.REACT_APP_BACKEND_BASE_URL
```
The local frontend environment used:
```env
REACT_APP_BACKEND_BASE_URL=http://localhost:5000
```
After restarting React, the frontend could call the backend correctly.

This matters in DevOps because ensuring that the page is loads correctly is not enough. The application must be tested through the full dependency chain. From Frontend --> Backend --> Database.
This creates a known baseline before changes are introduced.
## 2. Verify the Productino Frontend Build
The React application was also tested with:
```bash
npm run build
```
This proves the source can create a production ready frontend bundle:
The difference is npm start gives development runtime as npm run build created production build generation. A successful build is necessary but it does not prove that the full application works end-to-end.
## 3. Move Service Communication into Docker Networking
The next goal was to remove the developer laptop from service to service communication. 
Instead of:
```plaintext
Backend --> localhost --> PostgreSQL
```
The containerized environment uses:
```plaintext
Backend --> postgres:5432
```
Inside Docker, localhost means the current container. Containers should communicate using Docker service names or internal DNS. A production application should not depend on one engineer's laptop, IP address, or local networking configuration.
Container networking improves:
- Portability
- Consistency
- Isolation
- Security boundaries
- CI/CD automation

This same service to service idea is used later in platforms such as Kubernetes & ECS.
## 4. Build and Validate the Containers
The backend and frontend images were built from their Dockerfiles. The backend was configured to connect to PostgresSQL through the Docker network.
The frontend was served through Nginx and exposed locally on:
```plaintext
http://localhost:8080
```
The browser Network tab showed successful requests and application records appeared on the page. That proved the application browser has communicated all three containers.
## 5. Replace Manual Docker commands with Docker Compose
Docker Compose turns manual setup into configuration. A new engineer should not need tribal knowledge or a long list of commands to reproduce the environment. Compose improves:
- Onboarding
- Consistency
- Troubleshooting
- Documentation
- Automation readiness
  
once the individual containers worked, the setup was converted into:
```plaintext
docker-compose.yml
```
Instead of manually running several docker run and network commands, Compose defines:
- frontend
- backend
- postgress
- network
- volume

The stack can be started with:
```bash
docker compose up -d
```
and stopped with:
```bash
docker compose down
```
## 6. Add Automatic Database Initialization
A fresh PostgresSQL Compose volume created a new database, but the backend returned: relation "items_table" does not exist
This showed that infrastructure existed, but the application schema did not. so a new file was created:
```plaintext
Daabase/init.sql
```
with: 
```SQL
CREATE TABLE IF NOT EXISTS items_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);
```
The Compose file mounts it into PostgreSQL:
```YAML
volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./Database/init.sql:/docker-entrypoint-initdb.d/init.sql
```
On a fresh database volume, PostgreSQL automatically executes initialization scripts in that directory. The PostgreSQL starts finds the fresh database detected. Then the init.sql runs leading the items table to be created. 
A real deployment should not require an engineer to manually open psql and create tables after every fresh deployment. You want Database initialization to be automable, predictable and version controlled. This is the same principle behind formal migration systems used in larger applications.

##7. Add a PostgreSQL Health Check
During Compose startup, the backend initially attempted to connect before PostgreSQL was ready. 

The PostgreSQL service received a health check:
```YAML
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
  interval: 5s
  timeout: 5s
  retries: 5
```
The backend dependency was changed to:
```YAML
depends_on:
  postgres:
    condition: service_healthy
```
With what is going on is PostgreSQL starts sending the pg command check the PostgreSQL. The Database returns healthy, then the backend starts. This protects automated deployments from race conditions.
## 8. Move Database credentials out of Compose
Instead of hardcoding database values directly into docker-compose.yml, Compose now reference variables:
```YAML
POSTGRES_USER: ${POSTGRES_USER}
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
POSTGRES_DB: ${POSTGRES_DB}
```
The backend connection string uses:
```YAML
DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
```
The actual local values are stored in a root .env file. That env is ignored in Git. Version control should contain configuration structure, not secrets. For a local learning environment, .env is useful. In enterprise environments, the same values normally come from:
- AWS Secrets Manager
- AWS Systems Manager Parameter Store
- HashiCorp Vault
- Kubernetes Secrets

## 9. Add Persistent PostgreSQL Storage
A named volume was added:
```YAML
volumes:
  postgres_data:
```
PostgreSQL stores data in:
```YAML
- postgres_data:/var/lib/postgresql/data
```
This separates persistent data from the lifecycle of the container.
The persistence test is:
```bash
docker compose down
docker compose up -d
```
If the data remains, persistence is working. Containers should be disposable. Persistent business data should not disappear when a container is recreated.
## Validate the Complete Compose Environment
The final validation should prove:
```plaintext
[PASS] PostgreSQL starts
[PASS] PostgreSQL becomes healthy
[PASS] init.sql creates items_table
[PASS] Backend starts
[PASS] Backend connects to PostgreSQL
[PASS] Frontend starts
[PASS] API returns successful responses
[PASS] Browser CRUD works
[PASS] Data survives compose down/up
```
Usefule commands:
```bash
docker compose config
docker compose ps
docker compose logs postgres
docker compose logs backend
curl -i http://localhost:5000/api/items
```
The frontend is verified at: http://localhost:8080

## 11. Git Cleanup Before CI/CD
Before committing, Git changes were reviewed carefully.
```plaintext
Client/src/App.js
```
was kept
Generated React files under:
```plaintext
Client/build/
```
were restored instead of being mixed into the source-code commit. The final working infrastructure changes include files such as:
```plaintext
docker-compose.yml
Database/init.sql
Client/src/App.js
```
while .env stays out of Git.

Now the architecture looks like: Browser --> Frontend(Nginx)--> Backedn(Express)--> PostgreSQL--Named Volume

Docker Compose now manages:
- Service startup
- Networking
- Database initialization
- Health checks
- Persistent storage
- Environment configuration

CI/CD should not be where a deployment process is invented. It should automate a process that already works. This created a baseline that the application is validated, containers & compose are validated, Database automated, health checks added, configuration protected. This leaves for our CI/CD pipeline to being.

# PHASE 3- CI/CD DevSecOps Update
## 1. GitHub Actions CI
After the local application and Docker compose stack were proven manually, the next phase is automation.
The workflow was created at:
```plaintext
.github/workflows/ci-cd.yml
```
It runs against the devops-pipeline branch and validates:
- Checkout
- Node.Js setup
- Install frontend dependencies
- Build React
- Install backend dependencies
- Validate Docker Compose
- Build Docker images
Understand CI should automatically answer whether a source-code change can still produce a deployable application.
## 2. Publish Images to GitHub Container Registry
A second job, push-images was added after build-and-test. Images are published to GitHub Registry only after CI succeeds. The images are tagged with both latest and the Git commit SHA so a running image can be traced back to the extract source revision that produced it. This supports rollback & incident response.

## 3. Add Trivy Security Scanning
Trivy was inserted between image build and image push to find High/Critical findings. The pipeline intentionally used a non-zero exit code for High/Critical findings. The goal was not simply to report vulnerabilities, but to stop vulnerable images from being promoted.

## 4. Backend Security Remediation
The first backend scan found vulnerabilities in both Alpine OS packages and Node/global tooling. The remediation process was:
- Identify vulnerable package
- Identify which image layer introduced it
- Update or remove that layer/tool
- Rebuild with --pull --no-cache
- Rescan

The backend base image was upgraded from the older Node/Alpine combination to a newer supported Node/Alpine release. Global packages were also inspected inside the build image. The remaining vulnerable packages were traced to global npm and pm2, not the application dependency tree. Because PM2 was not necessary inside a Docker-managed runtime, the backend was simplified from: 

Docker --> PM2 --> Node --> server.js

to

Docker --> Node --> server.js

The Dockerfile was converted to a multi-stage build so the final runtime image contained only the production dependencies and runtime components actually required by the application. Why this matters: removing unnecessary software reduces attack surface, image size and future maintenance. 

## 5. Frontend Security Remediation
After the backend passed Trivy, the remaining findings came from the frontend image. The frontend uses a multi-stage Dockerfile: Node build stage to Nginx runtime stage
The remaining vulnerabilities were therefore investigated in the final Nginx/Alpine runtime rather than the React source code itself. The frontend image was updated by using a newer build/runtime base, upgrading Alpine packages and keeping the final runtime minimal.

The React API environment variable was also corrected to use:
```plaintext
REACT_APP_BACKEND_BASE_URL
```
during the build stage. A React environment variable is compiled into the static bundle during npm run build; setting the old variable only in the Nginx runtime stage does not dynamically rewrite the already built frontend.

## 6. Successful DevSecOps Gate
After iterative remediation, both backend and frontend images successfully passed Trivy. 

[Install image]

This is an important DevSecOps milestone: image promotion is now conditional on both build correctness and security policy.

## Current Status

```plaintext
[PASS] Application reverse engineering
[PASS] Frontend/backend/database validation
[PASS] Manual CRUD testing
[PASS] Docker networking
[PASS] Docker Compose
[PASS] Automatic database initialization
[PASS] PostgreSQL health checks
[PASS] Persistent volume
[PASS] Environment variable separation
[PASS] GitHub Actions CI
[PASS] GHCR image publishing
[PASS] Backend Trivy remediation
[PASS] Frontend Trivy remediation
[PASS] HIGH/CRITICAL image security gate
```
DevSecOps is using scan results to identify where risk enters the image, remove unnecessary software, update vulnerable layers, and allow only approved artifacts to move forward. 

# AWS Deployment
[Insert AWS secops architecture image]
We moved the PERN application from a local Docker/GHCR deployment into a production style AWS architecture. The working cloud request path is now:

Internet --> Application Load Balancer --> Private EC2 Instance --> Docker Compose --> Nginx Frontend --> Express Backend --> PostgreSQL

The application is reachable through the ALB while the EC2 server does not require a public IP.

## 1. Replace Browser-Side Hostnames with Nginx Reverse Proxy

The frontend originally called:
```plaintext
http://backend:5000/api/items
```
That hostname works only inside Docker's private network. A browser cannot resolve the Docker service name backend.
A temporary localhost:5000 fix worked locally, buit it would not work for remote users because localhost would point to the visitor's computer.
The final solution was to make React use relative API routes:
```plaintext
/api/items
```
Nginx now proxies /api requests internally to:
```plaintext
http://backend:5000
```
The browser now interacts with Nginx which retrieves the React static files and the api communicates to backend:5000
The frontend image is now portable between local Docker, EC2, an ALB DNS name and a future custom domain without rebuilding React with a different backend hostname.
# 2. Add Custom Nginx Configuration
A Client/nginx.conf file was added with a reverse-proxy rule:
```nginx
location /api/ {
    proxy_pass http://backend:5000;
}
```
The frontend Dockerfile was updated with:
```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```
The old frontend backend URL environment variable was removed because the browser no longer needs to know the backend hostname.
# 3. Fix React CRUD Routing
All frontend Axios requests now use relative routes:
```plaintext
GET    /api/items
POST   /api/items
PUT    /api/items/:id
DELETE /api/items/:id
```
During the refactor, the React build failed because the update function referenced an undefined variable. The application already tracked the selected record as editId, so the update request was corrected to:
```JavaScript
axios.put(`/api/items/${editId}`, ...)
```
This demonstrated that the build stage is functioning as a quality gate: invalid source code cannot be promoted into a container image.
# 4. Validate the Reverse Proxy Locally
The proxy was tested with:
```bash
curl -i http://localhost:8080/api/items
```
and returned:
```plaintext
HTTP/1.1 200 OK
```
The browser Network tab also showed: http://localhost:8080/api/items
The CREATE, READ, UPDATE, DELETE were tested successfully through Nginx.
# 5. Promote the Proxy Through CI/CD
The React routing changes, frontend Dockerfile, customer Nginx configuration and deployment Compose file were committed to my secondary branch (devops-pipeline).
The generated files under Client/build/ changed after npm run build; those generated artifacts were restored rather than included in the source commit. 

The GitHub Actions passed again: Build --> Docker image build --> Trivy --> GHCR publish
# 6. Create a Custom AWS VPC
A custom VPC architecture was designed instead of using the default VPC

The public subnets host public-facing infrastructure such as the ALB and NAT Gateway. The private application subnet hosts EC2. The private database subnets are reserved for a future RDS migration.
# 7. Configure Internet and Private Routing
The public route table uses:
```plaintext
0.0.0.0/0 → Internet Gateway
```
The private application route table uses:
```plaintext
0.0.0.0/0 → NAT Gateway
```
This allows the private EC2 instance to pull packages and GHCR images without receiving a public IP.
# 8. Add the Application Load Balancer
An internet-facing Application Load Balancer was created across two public subnets.
Configuration:
```plaintext
Listener: HTTP :80
Target group: pern-app-tg
Target port: 80
Health check: /
```
The target later became healthy, proving that the ALB could reach Nginx on the private EC2 server.
# 9. Apply Security Group Segmentation
The ALB security group allows public web traffic. The application security group allows port 80 only from the ALB security group. 
```plaintext
Internet → ALB :80
ALB → EC2 :80
Nginx → backend:5000
Backend → postgres:5432
```
# 10. Harden Deployment Compose for EC2
The production Compose file was changed so only the frontend is published on the EC2 host:
```YAML
frontend:
  ports:
    - "80:80"
```
The backend now uses:
```YAML
expose:
  - "5000"
```
instead of publishing host port 5000. This reduces attack surface because Express is accessible only through Nginx inside the Docker network.
# 11. Launch a Private EC2 Instance
The EC2 application server was launched in private-app-a with:
# 12. Use Systems Manager Instead of Public SSH
The EC2 IAM role allows Session Manager access. The server does not need public IP or an open SSH port. 
# 13. Install and Configure Docker on EC2
Docker and Docker Compose were installed.
The initial SSM shell user could not access the Docker daemon. The active user was ssm-user, so it was added to the Docker group and the session was restarted.
After that:
```bash
docker ps
```
# 14. Create the EC2 Deployment Directory
```plaintext
~/pern-devops/
├── docker-compose.deploy.yml
├── .env
└── Database/
    └── init.sql
```
The EC2 host does not rebuild application source. It pulls CI-approved images from GHCR.
# 15. Pull GHCR Images and Start the Stack
The private EC2 instance successfully pulled:
```plaintext
ghcr.io/armond107rah/pern-backend:latest
ghcr.io/armond107rah/pern-frontend:latest
postgres:16
```
The stack was started with Docker Compose. The ALB target group became healthy after Nginx began listening on port 80.
# 16. Validate the Public AWS Application Path
The application was successfully reached through the ALB. So our validated path is complete

Browser --> Public ALB --> Private EC2 -- Nginx --> Express --> PostgreSQL

This completed the manual AWS deployment stage.
# Continuous Deployment Design
The next phase will automate deployment using:

GitHub Actions --> AWS OIDC --> Systems Manager Run Command ---> Private EC2 --> docker compose pull --> docker compose up -d --> curl health check

This avoids long lived AWS access keys and avoids opening SSH to the server. 

```plaintext
[PASS] Local PERN validation
[PASS] CRUD testing
[PASS] Docker Compose
[PASS] Database initialization
[PASS] Health checks
[PASS] Persistent storage
[PASS] GitHub Actions CI
[PASS] GHCR publishing
[PASS] Trivy security gate
[PASS] Backend hardening
[PASS] Frontend hardening
[PASS] Nginx reverse proxy
[PASS] Relative /api routing
[PASS] Custom AWS VPC
[PASS] Public/private subnet design
[PASS] Internet Gateway
[PASS] NAT Gateway
[PASS] Application Load Balancer
[PASS] Security group segmentation
[PASS] Private EC2
[PASS] Systems Manager access
[PASS] Docker on EC2
[PASS] GHCR pull on EC2
[PASS] Healthy ALB target
[PASS] Application reachable through ALB
```
# Authenticate GitHub to AWS with OIDC
GitHub Actions --> OIDC --> AWS STS --> IAM ROLE --> Temporary Credentials

The trust relationship is limited to the intended repository and branch. 
## Automate Continuous Deployment
Systems Manager executes:
```bash
docker compose -f docker-compose.deploy.yml pull
docker compose -f docker-compose.deploy.yml up -d
docker compose -f docker-compose.deploy.yml ps
```
## Verify the Deployment
The pipeline calls http://localhost/api/items
and retries while the application initializes. If the endpoint fails to become healthy, the deployment job fails.

[insert pipeline deployment image]

# Enterprise Relevance
Although this project uses a single EC2 application host, the concepts map directly to larger environments:
- CI/CD controls software promotion
- immutable container artifacts improve repeatability
- registries create a versioned artifact boundary
- vulnerability scanning introduces automated security governance
- private networking reduces attack surface
- IAM and OIDC provide temporary workload identity
- SSM reduces dependence on inbound administration
- load balancers separate public traffic from application compute
- health checks provide automated deployment validation
