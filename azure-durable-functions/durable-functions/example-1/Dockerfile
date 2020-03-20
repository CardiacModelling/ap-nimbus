FROM node:10

WORKDIR /usr/src/app

RUN wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.asc.gpg && \
    mv microsoft.asc.gpg /etc/apt/trusted.gpg.d/ && \
    wget -q https://packages.microsoft.com/config/debian/9/prod.list && \
    mv prod.list /etc/apt/sources.list.d/microsoft-prod.list 

# It seems to need fooling into thinking it can https!
RUN cd /usr/lib/apt/methods && ln -s http https

RUN apt-get update && \
    apt-get install apt-transport-https -y && \
    apt-get update && \
    apt-get install dotnet-sdk-2.1 -y

# Reset
RUN cd /usr/lib/apt/methods && rm -f https

COPY . .

RUN npm install

# Creates the following ... 
# /usr/local/bin/func -> /usr/local/lib/node_modules/azure-functions-core-tools/lib/main.js
# /usr/local/bin/azfun -> /usr/local/lib/node_modules/azure-functions-core-tools/lib/main.js
# /usr/local/bin/azurefunctions -> /usr/local/lib/node_modules/azure-functions-core-tools/lib/main.js

RUN npm install durable-functions@1.3.3 && \
    npm install -g azure-functions-core-tools@2.7.2254 --unsafe-perm true

# Requires dotnet sdk to be installed.
RUN func extensions install --javascript

EXPOSE 7071

# Telemetry
# ---------
# The .NET Core tools collect usage data in order to help us improve your experience.
# The data is anonymous and doesn't include command-line arguments.
# The data is collected by Microsoft and shared with the community.
# You can opt-out of telemetry by setting the DOTNET_CLI_TELEMETRY_OPTOUT environment variable to '1' or 'true' using your favorite shell.

# The Azure Functions Core tools collect usage data in order to help us improve your experience. 
# The data is anonymous and doesn't include any user specific or personal information. The data is collected by Microsoft.
# You can opt-out of telemetry by setting the FUNCTIONS_CORE_TOOLS_TELEMETRY_OPTOUT environment variable to '1' or 'true' using your favorite shell.

ENV FUNCTIONS_CORE_TOOLS_TELEMETRY_OPTOUT=true
ENV DOTNET_CLI_TELEMETRY_OPTOUT=true

CMD [ "func", "host", "start", "--javascript" ]
