# Coderight

Simple demo Node.js app used for the Coderight project.

Quick start

- Install dependencies: npm ci
- Run locally: npm start
- Run smoke test: npm test

Docker

Build: docker build -t coderight:local .
Run: docker run -p 3000:3000 coderight:local

CI

A basic GitHub Actions CI workflow runs on push and PR to main. It runs npm ci, npm test, and uploads an npm audit report.
