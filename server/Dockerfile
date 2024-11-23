# Step 1: Use Node.js base image
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Step 4: Install dependencies specified in package.json
RUN npm install

# Step 5: Copy the rest of the backend files to the container
COPY . .

# Step 6: Expose the port the backend will run on
EXPOSE 3000

# Step 7: Command to run the backend server
CMD ["npm", "start"]
