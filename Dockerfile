# build JAR
FROM --platform=linux/amd64 maven:3-eclipse-temurin-25 AS build
WORKDIR /build/
COPY /third-party/TweetyProjectTeam/TweetyProject .
RUN --mount=type=cache,target=/root/.m2 \
    mvn --batch-mode \dependency:go-offline dependency:resolve-plugins
RUN --mount=type=cache,target=/root/.m2 \
    mvn --batch-mode --fail-fast -Dgpg.skip -Dmaven.test.skip \
    -pl org-tweetyproject-web -am \
    install
RUN --mount=type=cache,target=/root/.m2  \
    mvn --batch-mode --fail-fast -Dgpg.skip -Dmaven.test.skip \
    -pl org-tweetyproject-web \
    package spring-boot:repackage

FROM --platform=linux/amd64 caddy:latest AS caddy

# runtime
FROM --platform=linux/amd64 eclipse-temurin:25-jre
WORKDIR /opt/app
# Prepare server for static files and proxying to backend
RUN mkdir -p /var/www && chown www-data:www-data /var/www
COPY --from=caddy /usr/bin/caddy caddy
COPY /deployment/Caddyfile Caddyfile
COPY --chown=www-data:www-data /dist/ dist
# Prepare backend
# The TweetyProject web server expects /opt/app/logs to exist,
# even if we override the logging config and thus making the path unused.
RUN mkdir -p /opt/app/logs && chown www-data:www-data /opt/app/logs
COPY /deployment/logback.xml logback.xml
COPY --from=build /build/org-tweetyproject-web/target/web-*.jar web.jar
COPY --chmod=755 /deployment/wrapper_script.sh wrapper_script.sh
USER www-data
ENTRYPOINT ["./wrapper_script.sh"]