# ==========================================
# Stage 1: Install application dependencies
# ==========================================

FROM node:24-alpine AS dependencies

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci --omit=dev


# ==========================================
# Stage 2: Production runtime
# ==========================================

FROM node:24-alpine

WORKDIR /usr/app

# Install current Alpine security patches
RUN apk upgrade --no-cache

# Copy only the installed production dependencies
COPY --from=dependencies /usr/app/node_modules ./node_modules

# Copy application source
COPY . .

# Remove npm/npx from the final runtime image.
# They were needed to build dependencies, but not to run server.js.
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm \
    && rm -f /usr/local/bin/npx

EXPOSE 5000

CMD ["node", "server.js"]
