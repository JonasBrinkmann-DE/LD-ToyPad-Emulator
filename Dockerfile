# Use Node.js 22 Alpine image for ARMv6 (e.g. arm32v6) - adjust if you have a custom image
FROM node:22.15.0-alpine

WORKDIR /app

# Install build dependencies in one step
RUN apk add g++ make py3-pip
# Setup USB modules to load (container approximation)
RUN echo "dwc2" > /etc/modules-load.d/toypad.conf && \
    echo "libcomposite" >> /etc/modules-load.d/toypad.conf && \
    echo "usb_f_rndis" >> /etc/modules-load.d/toypad.conf

COPY package*.json ./

RUN npm install -g npm@11.4.1

RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY public ./public

RUN npx tsc

EXPOSE 80

CMD ["node", "build/index.js"]
