# Rate My Professor Agent

A Node.js application that helps students find and evaluate professors based on their queries. This application uses Pinecone for vector-based search and Together AI for natural language processing.

## Features

- **Search Professors:** Finds and retrieves the top professors based on a user's query.
- **Generate Embeddings:** Uses Together AI to convert text queries into vector embeddings.
- **Query Database:** Leverages Pinecone to search for professors based on the generated embeddings.
- **Chat Completion:** Generates responses using Together AI’s chat completion model.

## Technologies

- **Pinecone:** Vector database for similarity search.
- **Together AI:** API for generating text embeddings and chat completions.
- **Next.js:** Framework for building the server-side application.

## Prerequisites

- Node.js (v14 or higher)
- An API key for Pinecone
- An API key for Together AI