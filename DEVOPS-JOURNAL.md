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
