# Use the official Node.js image to build the frontend
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code to the container
COPY . .

# Build the frontend
RUN npm run build

# Use the official Nginx image to serve the frontend
FROM nginx:alpine

# Copy the built frontend files to the Nginx container
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration file if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Nginx will run on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]