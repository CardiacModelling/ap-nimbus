FROM node:10.12.0-alpine
COPY /deps/wait /wait
WORKDIR /home/nodejs/app
ENV NODE_ENV prod
COPY package*.json index.js ./
COPY routes/ routes/
RUN npm install --only=production
ARG port=8118
EXPOSE $port
RUN chmod +x /wait
CMD /wait && node index.js
 
