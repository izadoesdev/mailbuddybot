FROM oven/bun:1 AS builder

WORKDIR /app

# Install necessary build dependencies for canvas
RUN apt-get update && apt-get install -y \
    pkg-config \
    build-essential \
    python3 \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build TypeScript code
RUN bun run build

FROM oven/bun:1-slim AS runner

WORKDIR /app

# Install only necessary runtime dependencies for canvas
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango1.0-0 \
    libjpeg62-turbo \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and built code
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copy database scripts
COPY --from=builder /app/src/database ./database

# Create a non-root user
RUN addgroup --system --gid 1001 bunjs \
    && adduser --system --uid 1001 botuser \
    && chown -R botuser:bunjs /app

USER botuser

# Set environment variables
ENV NODE_ENV=production

CMD ["bun", "run", "src/index.ts"] 