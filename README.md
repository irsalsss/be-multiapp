# Backend Monorepo

A Lerna and NPM Workspaces powered monorepo for managing multiple Express.js/TypeScript backend microservices. Currently contains the `ai-chat` application, which utilizes MongoDB, Clerk, and ImageKit.

**Live Demo (AI Thread):** [https://i-faaza.com/app/ai-thread](https://i-faaza.com/app/ai-thread)

## 🚀 Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (v9 or higher)
- [Redis](https://redis.io/) (v7 or higher) - Required for Quota Management/Rate Limiting.
- A running MongoDB instance or a MongoDB Atlas connection string.
- A Clerk account for authentication.
- An ImageKit account for media handling.

## 🛠️ Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   # navigate to your directory
   cd be-multiapp
   ```

2. **Install dependencies**:
   Run this from the **root** directory. PNPM Workspaces will automatically link packages:
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**:
   Depending on how you plan to run the application, configure your environment variables:
   
   **Option A: Using Docker Compose (Recommended)**
   Create a `docker-compose.override.yml` file in the root directory for your local development secrets. This file is ignored by Git.
   ```yaml
   version: '3.8'
   services:
     api:
       environment:
         - IMAGE_KIT_ENDPOINT=your_imagekit_endpoint
         - IMAGE_KIT_PUBLIC_KEY=your_imagekit_public_key
         - IMAGE_KIT_PRIVATE_KEY=your_imagekit_private_key
         - CLIENT_URL=http://localhost:5173
         - MONGO=your_mongodb_connection_string
         - CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
         - CLERK_SECRET_KEY=your_clerk_secret_key
         - REDIS_PRIVATE_URL=redis://localhost:6379
         - GEMINI_API_KEY=your_gemini_api_key
   ```
   
   **Option B: Running locally with npm**
   Create a `.env` file in the root directory. You can use the existing `env` file as a template (`cp env .env`), then populate it:
   ```env
   # ImageKit credentials
   IMAGE_KIT_ENDPOINT=your_imagekit_endpoint
   IMAGE_KIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGE_KIT_PRIVATE_KEY=your_imagekit_private_key
   
   # Frontend Client URL (for CORS)
   CLIENT_URL=http://localhost:5173
   
   # MongoDB Connection String
   MONGO=your_mongodb_connection_string
   
   # Clerk Authentication credentials
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Redis Connection
   REDIS_PRIVATE_URL=redis://127.0.0.1:6379

   # Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key
   ```

## 💻 Running the Application

### Development Mode

To run `ai-chat` in development mode:

```bash
pnpm --filter ai-chat dev
```
*(Or `cd apps/ai-chat && pnpm dev`)*

> **Note**: Pastikan Redis Server sudah berjalan di lokal (atau melalui Docker terpisah) sebelum menjalankan aplikasi.

The server should now be running.

### Production Mode

To build and run the application for production locally:

1. **Build all apps using Lerna**:
   ```bash
   npx lerna run build
   ```

2. **Start the compiled application**:
   ```bash
   npm start --workspace=apps/ai-chat
   ```

### Using Docker

You can also run the application using Docker. This ensures a consistent environment and simplifies deployment.

We use Docker Compose overrides to manage environments without relying on a `.env` file.

**Local Development**:
1. Edit the `docker-compose.override.yml` file to include your local environment variables.
2. Run Docker Compose. It will automatically merge the `override` file with the base `docker-compose.yml`:
   ```bash
   docker-compose up -d
   ```
   *To rebuild the image if you make changes, run `docker-compose up --build -d`.*

**Production Deployment**:
1. Edit the `docker-compose.prod.yml` file with your actual production credentials.
2. Tell Docker Compose to use both the base file and the production file explicitly:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### ☁️ Railway Deployment (Recommended)

1. Add a **Redis** service in your Railway project.
2. In your API service settings, add a variable: `REDIS_PRIVATE_URL` with value `${{Redis.REDIS_PRIVATE_URL}}`.
3. Railway will handle the connection automatically.

To stop the container in either environment:
```bash
docker-compose down
```

## 📚 Tech Stack

- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Caching/Rate Limiting**: [Redis](https://redis.io/) via `ioredis`
- **Authentication**: [Clerk](https://clerk.com/) (`@clerk/express`)
- **Other**: `cors`, `dotenv`, `pnpm`
