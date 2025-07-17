# Stage 1: Build stage to download the model
FROM ollama/ollama:latest as model_downloader

# Set OLLAMA_HOST for the build context
ENV OLLAMA_HOST=0.0.0.0

# Ensure the model directory exists and has correct permissions
WORKDIR /root/.ollama

# Run ollama serve in the background, pull the model, and then shut down the server
RUN ollama serve & \
    PID=$! && \
    sleep 10 && \
    ollama pull gemma3:4b && \
    kill "$PID" && \
    wait "$PID" || true


# Stage 2: Final image
FROM ollama/ollama:latest

# Copy the downloaded model from the previous stage
COPY --from=model_downloader /root/.ollama /root/.ollama

# Set OLLAMA_HOST for runtime
ENV OLLAMA_HOST=0.0.0.0

# Expose the port (optional, but good practice for clarity)
EXPOSE 11434

# Default command to serve Ollama
CMD ["serve"]
