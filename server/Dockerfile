FROM node:18-alpine

RUN apk add --no-cache \
    python3 \
    py3-pip \
    texlive-full \
    make \
    bash \
    curl \
    tini

ENTRYPOINT ["/sbin/tini", "--"]

RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
RUN pip install --no-cache-dir Pygments

WORKDIR /app

COPY package*.json ./
RUN npm install --production --legacy-peer-deps

COPY . .

# Execute the Makefile
RUN make

EXPOSE 3001
RUN adduser -D appuser && chown -R appuser /app
USER appuser

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "start"]