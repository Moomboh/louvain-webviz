FROM ubuntu:20.04

# only major version for node via nodesource can be specfied
# minor version for node via nodesource must be `.x` and cannot be specified
# see also https://github.com/nodesource/distributions/blob/master/README.md
ARG NODESOURCE_VERSION=18.x 

ARG PLAYWRIGHT_VERSION=1.20.2

ARG DEBIAN_FRONTEND=noninteractive
RUN set -ex \
    && apt-get -y update && apt-get install -y \
    curl \
    git \
    bash-completion \
    && curl -fsSL https://deb.nodesource.com/setup_${NODESOURCE_VERSION} | bash - \
    && apt-get -y install \
    nodejs \
    && rm -rf /var/lib/apt/lists/* \
    # install playwright dependencies
    && npm install --global playwright@${PLAYWRIGHT_VERSION} \
    && npx playwright install-deps \
    # add non root user
    && useradd -ms /bin/bash node

# switch to no root user for better security
USER node
# install playwright browser binaries
RUN npx playwright install 