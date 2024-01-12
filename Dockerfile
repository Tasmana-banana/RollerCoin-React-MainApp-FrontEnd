FROM node:18.16.1

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY .npmrc /usr/src/app/
RUN npm install

COPY ecosystem.config.js /usr/src/app/
RUN npm install pm2 -g

# Bundle app source
COPY . /usr/src/app
RUN npm run build

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
