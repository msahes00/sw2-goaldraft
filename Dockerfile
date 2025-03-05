# Use the official Deno image as the base image
FROM denoland/deno:alpine

# Set the working directory
WORKDIR /app

# Copy the necessary files to the container
COPY . . 

# Expose the port the app runs on
EXPOSE 8000

# Install the necessary dependencies
RUN deno install

# Run the application
CMD ["run", "serve"]