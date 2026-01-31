# Use Python 3.11 as the base
FROM python:3.11-slim

# Install system dependencies for AI libraries (Whisper/OpenCV)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && apt-get clean

WORKDIR /app

# Copy dependencies first to speed up builds
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code AND the shared folder
COPY backend/ .
COPY shared/ ./shared

CMD ["python", "app.py"]