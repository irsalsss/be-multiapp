# node-ai-chatbot (Backend)

An Express.js and TypeScript-based backend application. This service utilizes MongoDB for data storage, Clerk for user authentication, and ImageKit for image management.

## 🚀 Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
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
   Using npm:
   ```bash
   npm install
   ```
   Or using yarn:
   ```bash
   yarn install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory. You can use the existing `env` file as a template:
   ```bash
   cp env .env
   ```
   
   Then, populate the `.env` file with your actual API keys and credentials:
   ```env
   # ImageKit credentials
   IMAGE_KIT_ENDPOINT=your_imagekit_endpoint
   IMAGE_KIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGE_KIT_PRIVATE_KEY=your_imagekit_private_key
   
   # Frontend Client URL (for CORS)
   CLIENT_URL=http://localhost:3000
   
   # MongoDB Connection String
   MONGO=your_mongodb_connection_string
   
   # Clerk Authentication credentials
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

## 💻 Running the Application

### Development Mode

To run the application in development mode with hot-reloading (using `ts-node-dev`):

```bash
npm run dev
```

The server should now be running (typically on `http://localhost:3000` or whichever port is defined in your `src/index.ts`).

### Production Mode

To build and run the application for production:

1. **Build the TypeScript files**:
   ```bash
   npm run build
   ```
   *This compiles the TypeScript code in `src/` to JavaScript in the `dist/` folder.*

2. **Start the compiled application**:
   ```bash
   npm start
   ```

## 📚 Tech Stack

- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Clerk](https://clerk.com/) (`@clerk/express`)
- **Other**: `cors`, `dotenv`
