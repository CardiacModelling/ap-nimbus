#!/bin/sh

sed -i "s|__api_url_appmgr|$REST_API_URL_APPMGR|" src/env.js
sed -i "s|__api_url_data|$REST_API_URL_DATA|" src/env.js

exec "$@"
