FROM nginx:alpine
# Copy your project files into the Nginx public directory
COPY . /usr/share/nginx/html
# Expose port 80 (standard for web traffic)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
