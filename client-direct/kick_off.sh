#!/bin/sh -e

# Do not use 127.0.0.1 if using a docker image (because otherwise it'll be
# listening on 127.0.0.1 within the image and therefore not reachable from
# outside!)
# Also keep in mind that Dockerfile EXPOSEs 4200!

cd_host=${1:-0.0.0.0}
cd_port=${2:-4200}

export PATH=/usr/src/app/node_modules/.bin:$PATH

echo ""
echo "WARNING : Angular's 'open your browser on ...' message assumes too much!"
echo "          Also try 'http://<your ip>:4200/' or 'http://<docker net ip>:4200/'"
echo ""
ng serve --host ${cd_host} --port ${cd_port}
