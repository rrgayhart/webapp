FROM node:6.4.0

# Set up working directory
RUN mkdir /app
WORKDIR /app

# Install dependencies
COPY package.json /app/package.json
RUN npm install

# Add the rest of the app's code
COPY . /app

EXPOSE 6660
CMD [ "npm", "start" ]
