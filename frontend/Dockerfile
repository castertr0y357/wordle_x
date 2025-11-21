# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package.json ./
# COPY package-lock.json ./ 

# If you use yarn, uncomment the next line and comment out the npm lines
# COPY yarn.lock ./
# RUN yarn install

RUN npm install --legacy-peer-deps
RUN npm install ajv@8 --legacy-peer-deps

ARG REACT_APP_BACKEND_URL=""
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
