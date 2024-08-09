# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose the port the service runs on
EXPOSE 3006

# Command to run the service
CMD ["npm", "run","dev"]
