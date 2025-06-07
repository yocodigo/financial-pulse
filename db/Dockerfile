FROM postgres:16
ENV POSTGRES_USER=dashboard
ENV POSTGRES_PASSWORD=dashboard
ENV POSTGRES_DB=dashboard
COPY init.sql /docker-entrypoint-initdb.d/
