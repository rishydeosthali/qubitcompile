# Use the official Python image.
FROM python:3.10-slim

# Set the working directory.
WORKDIR /app

# Copy the requirements file.
COPY requirements.txt .

# Install the dependencies.
RUN pip install --no-cache-dir -r requirements.txt

# Copy the function code.
COPY main.py .

# Set the command to run the function.
CMD ["functions-framework", "--target=execute_code", "--host=0.0.0.0"]
