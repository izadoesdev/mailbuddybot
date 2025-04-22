FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY src .

# Set environment variables
ENV NODE_ENV=production

CMD ["bun", "run", "src/index.ts"] 