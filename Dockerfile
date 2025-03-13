# ---- Base Node Image ----
FROM node:23-alpine AS base
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
ENV HUSKY=0
# ---- Dependencies ----
FROM base AS dependencies
RUN npm install --omit=dev

# ---- Build ----
FROM base AS build
COPY . .
RUN npm install
RUN npm run build

# ---- Production Image ----
FROM node:23-alpine AS production
WORKDIR /usr/src/app

# Copy dependencies
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy built files
COPY --from=build /usr/src/app/dist ./dist

# Expose the application port
EXPOSE 4400

# Command to run the application
CMD ["node", "dist/main.js"]