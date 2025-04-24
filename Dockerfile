FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY src .

# Create a non-root user
# RUN addgroup --system --gid 1001 bunjs \
#     && adduser --system --uid 1001 botuser \
#     && chown -R botuser:bunjs /app

# USER botuser

# Set environment variables
ENV NODE_ENV=production

CMD ["bun", "run", "index.ts"] 