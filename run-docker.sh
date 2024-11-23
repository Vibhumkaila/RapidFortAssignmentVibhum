#!/bin/bash

# Run Client (Frontend) Docker container
echo "Building and running the Client container..."
cd client
docker build -t my-app-client .
docker run -d -p 80:80 --name my-app-client my-app-client

# Run Server (Backend) Docker container
echo "Building and running the Server container..."
cd ../server
docker build -t my-app-server .
docker run -d -p 5000:3000 --name my-app-server my-app-server

echo "Containers are running:"
echo "Client is available on http://localhost"
echo "Server is available on http://localhost:5000"
