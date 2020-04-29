# base image
FROM node:10.13.0-alpine

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# install and cache app dependencies
COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm install

# add app
COPY . /usr/src/app

EXPOSE 4200

COPY entry_point.sh /entry_point.sh
ENTRYPOINT ["/entry_point.sh"]

# start app
CMD ["./kick_off.sh"]
