FROM node:18.10-alpine AS build

USER root
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
#
#CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "500"]

# Use official nginx image as the base image
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist/journal-indexer-ui /usr/share/nginx/html

# Replace default.conf with our angular application nginx configuration.
#
COPY journal-indexer-ui.conf /etc/nginx/conf.d/default.conf
# Expose port 80
EXPOSE 80
