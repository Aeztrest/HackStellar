FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Gerekli sistem paketleri + stellar CLI için araçlar
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    curl \
    ca-certificates \
    tar \
    libdbus-1-3 \
 && rm -rf /var/lib/apt/lists/*

# Stellar CLI kurulum
WORKDIR /usr/local/bin
RUN curl -L -o stellar-cli.tar.gz https://github.com/stellar/stellar-cli/releases/download/v23.2.1/stellar-cli-23.2.1-x86_64-unknown-linux-gnu.tar.gz \
    && tar -xzf stellar-cli.tar.gz \
    && chmod +x stellar \
    && rm -rf stellar-cli.tar.gz stellar-cli-23.2.1-x86_64-unknown-linux-gnu

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
