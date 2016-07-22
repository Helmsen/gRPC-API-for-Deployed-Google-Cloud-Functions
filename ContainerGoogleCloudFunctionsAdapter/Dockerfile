FROM ubuntu:16.04

MAINTAINER Wilhelm Stepan, Leon Graser, Dominik Bäßler

# Install packages
# ---------------
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y software-properties-common && \
    apt-get install -y python-software-properties && \
    apt-get install -y curl && \
    apt-get clean

# Install nodejs
# --------------
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs

# Install infrastructure
# ----------------------
RUN apt-get update && \
    apt-get install wget -y && \
    apt-get install python -y


# Install Google Cloud Functions SDK
# ----------------------------------
#RUN wget https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-116.0.0-linux-x86_64.tar.gz && \
#    tar -xzf google-cloud-sdk-116.0.0-linux-x86_64.tar.gz && \
#    ./google-cloud-sdk/install.sh --quiet
RUN export CLOUD_SDK_REPO="cloud-sdk-$(lsb_release -c -s)" && \
    echo "deb http://packages.cloud.google.com/apt $CLOUD_SDK_REPO main" | tee /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - && \
    apt-get update && \
    apt-get install google-cloud-sdk -y


# Folders
# ---------
RUN mkdir -p /fapra
RUN mkdir -p /api

# Files
# ----------
COPY node_modules /fapra/node_modules
COPY main.js /fapra/main.js
COPY urlParser.js /fapra/urlParser.js
COPY main.proto /api/main.proto

# Environment
# -------------
ENV API_PORT=50005
ENV API_PROTO_PATH=/api/main.proto

VOLUME /api
EXPOSE 50005
CMD ["node", "/fapra/main.js"]
