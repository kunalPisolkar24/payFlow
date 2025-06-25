#!/bin/sh
set -o errexit

IMAGE_TAG="localhost:5001/payflow:0.0.1"

echo "Building Docker image using Dockerfile.prod: ${IMAGE_TAG}"
docker build -f Dockerfile.prod -t "${IMAGE_TAG}" .

echo "Pushing image to local registry..."
docker push "${IMAGE_TAG}"

echo "✅ Image successfully pushed to the local registry."