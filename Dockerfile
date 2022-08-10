#Specify a base image
FROM node:alpine

#Specify a working directory
WORKDIR /usr/app

#Copy the dependencies file
COPY ./package.json ./

#Install dependencies
RUN npm ci

#Copy remaining files
COPY ./ ./

EXPOSE 8989

CMD [ "npm", "start" ]