# Build stage
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/ai-chat/package.json ./apps/ai-chat/
# We use npm install instead of ci because package-lock paths might vary, 
# but ideally npm ci works if package-lock is complete
RUN npm install

COPY apps/ai-chat/tsconfig.json ./apps/ai-chat/
COPY apps/ai-chat/src ./apps/ai-chat/src
RUN cd apps/ai-chat && npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/ai-chat/package.json ./apps/ai-chat/
RUN npm install --omit=dev

COPY --from=builder /app/apps/ai-chat/dist ./apps/ai-chat/dist

EXPOSE 4000
CMD ["npm", "start", "--workspace=apps/ai-chat"]
