## Stack

- Express
- Typescript
- Firebase
- AWS for Cloud storage

## Getting Started

Install dependencies:

```bash
npm install
```

Next, run the development server:

```bash
npm run dev
```

Server routes are hosted on [http://localhost:3001](http://localhost:3001)

## Secrets

Inside .env file, you should have a GOOGLE_APPLICATION_CREDENTIALS key that points to `firebase.json`, which contains credentials to initilize Firebase Admin SDK.

This .json credential can be generated from the firebase console

`GOOGLE_APPLICATION_CREDENTIALS="./firebase.json"`

AWS_KEY = "AWS key"
AWS_KEY_SECRET = "AWS key secret"
