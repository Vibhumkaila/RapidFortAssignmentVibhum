#!/bin/bash

# Run Client (Frontend) Docker container
echo "Building and running the Client container..."
cd client
docker build -t client .
docker run -d -p 80:80 --name client client 

# Run Server (Backend) Docker container
echo "Building and running the Server container..."
cd ../server
docker build -t server .
docker run -d -p 5000:3000 --name server server

echo "Containers are running:"
echo "Client is available on http://localhost"
echo "Server is available on http://localhost:5000"
