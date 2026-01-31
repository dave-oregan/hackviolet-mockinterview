FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# This copies from the root (where requirements.txt is)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# This copies the contents of the /backend folder into /app
COPY ./backend . 

EXPOSE 5000
CMD ["python", "app.py"]