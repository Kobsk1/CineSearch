FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY js/ /usr/share/nginx/html/js/
COPY css/ /usr/share/nginx/html/css/
EXPOSE 80