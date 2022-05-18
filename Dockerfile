# docker run -d --network mongo-network --name mongodb mongo
# docker run -d -p 80:80 --network mongo-network --name blogpost blogpost

FROM node:alpine
COPY ./ ./
RUN npm install
EXPOSE 80
CMD ["npm", "start"]