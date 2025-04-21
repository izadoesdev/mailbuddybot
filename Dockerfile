FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV DISCORD_TOKEN=${DISCORD_TOKEN}
ENV CLIENT_ID=${CLIENT_ID}
ENV GUILD_ID=${GUILD_ID}


# Start the application
CMD ["bun", "run", "src/index.ts"] 