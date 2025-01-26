FROM node:18-alpine

# Install LaTeX and Python dependencies
RUN apk add --no-cache \
    texlive-full \
    python3 \
    py3-pip \
    make

# Create and activate Python virtual environment
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Install Python requirements
RUN pip install Pygments

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]