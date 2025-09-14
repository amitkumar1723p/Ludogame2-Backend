# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy rest of the code
COPY . .

# Expose port (same as your Node.js app)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
