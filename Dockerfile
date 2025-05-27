FROM node:22.15.0-alpine
ENV CXXFLAGS="-std=c++17"

WORKDIR /app

RUN apk update && apk add --no-cache \
    build-base \
    python3 \
    libusb-dev \
    linux-headers \
    eudev-dev \
    g++ \
    make \
    py3-pip \
    py3-setuptools

RUN echo "dwc2" > /etc/modules-load.d/toypad.conf && \
    echo "libcomposite" >> /etc/modules-load.d/toypad.conf && \
    echo "usb_f_rndis" >> /etc/modules-load.d/toypad.conf

COPY package*.json ./

RUN npm install -g npm@11.4.1 typescript

RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY public ./public

RUN npm run build

EXPOSE 80
CMD ["npm", "run", "start"]