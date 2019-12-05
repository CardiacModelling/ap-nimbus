su root

apk add --no-cache inotify-tools jq oniguruma linux-headers

# Optional "wget --no-check-certificate "
cd /home/appredict/apps/node/ && \
  wget https://nodejs.org/dist/v10.13.0/node-v10.13.0.tar.gz && \
  tar -zxvf node-v10.13.0.tar.gz

cd /home/appredict/apps/node/node-v10.13.0 && \
  ./configure --prefix=/home/appredict/apps/node/v10.13.0 && \
  make -j${BUILD_PROCESSORS} && \
  make install && \
  rm -rf /home/appredict/apps/node/node-v10.13.0*

apk del linux-headers

su appredict

# Optional "npm_config_registry=http://registry.npmjs.org npm ci"
cd ${DIR_APPMANAGER} && npm ci
