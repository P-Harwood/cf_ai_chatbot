# Cloudflare AI Chat – Frontend

Stage 1: Basic Typescript and HTML UI to write messages, currently these messages are only displayed locally. No special formatting either.

## Tech

- TypeScript
- HTML + CSS

## Running locally

```bash
# compile TypeScript
npx tsc --build   # or tsc -b

# in /frontend/ run the following to start a python server, serving the HTML page 

python -m http.server 8000
# Do not try to run index.html from the local file as this will have cross origin errors. Interact through http://localhost:8000 in browser.
