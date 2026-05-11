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
# The TweetyProject web server expects /opt/app/logs to exist,
# even if we override the logging config and thus making the path unused.
WORKDIR /opt/app/logs
WORKDIR /opt/app
# Prepare server for static files and proxying to backend
COPY --from=caddy /usr/bin/caddy caddy
COPY /deployment/Caddyfile Caddyfile
COPY /dist/ dist
# Prepare backend
COPY /deployment/logback.xml logback.xml
COPY --from=build /build/org-tweetyproject-web/target/web-*.jar web.jar
COPY --chmod=755 /deployment/wrapper_script.sh wrapper_script.sh
RUN chown -R nobody:nogroup /opt/app
USER nobody
ENTRYPOINT ["./wrapper_script.sh"]