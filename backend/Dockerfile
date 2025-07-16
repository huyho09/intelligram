# Use an official Python runtime as a parent image (version 3.11)
FROM python:3.11-slim

# Install Java

RUN apt-get update && apt-get install -y openjdk-17-jdk && apt-get install -y graphviz

# Set the working directory in the container
WORKDIR /app

# Copy the project files into the working directory
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Run main.py when the container launches
CMD ["python", "main.py"]