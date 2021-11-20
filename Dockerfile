FROM node:14.16.0-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY ./ /usr/src/app
ENV PORT 80
EXPOSE 80
CMD [ "npm", "start" ]