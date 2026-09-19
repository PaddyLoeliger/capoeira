FROM node:22-bookworm
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN chmod +x /app/docker/entrypoint.sh
EXPOSE 3847
CMD ["bash", "/app/docker/entrypoint.sh"]
