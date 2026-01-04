# Getting Started
This is a simple Node.js application that uses the LangChain library to create embeddings for a PDF document and store them in a Supabase database. The application also includes a function to find the nearest match to a given query using the embeddings stored in the database. It uses Supabase and OpenAI as external services, make sure to check the .env.example file for the required environment variables. Add a PDF file to the root directory of the project and update the reference path_to_your_pdf.pdf in the src/index.ts file.

Install the dependencies and run the project

```
npm install
npm run dev
```

