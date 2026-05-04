# build
FROM --platform=linux/amd64 maven:3-eclipse-temurin-25 AS build
WORKDIR /build/
COPY /third-party/TweetyProjectTeam/TweetyProject .
RUN --mount=type=cache,target=/root/.m2 \
    mvn --batch-mode \dependency:go-offline dependency:resolve-plugins
RUN --mount=type=cache,target=/root/.m2 \
    mvn --batch-mode --fail-fast -Dgpg.skip -Dmaven.test.skip \
    -pl org-tweetyproject-web -am \
    package
RUN --mount=type=cache,target=/root/.m2  \
    mvn --batch-mode --fail-fast -Dgpg.skip -Dmaven.test.skip \
    -pl org-tweetyproject-web \
    package spring-boot:repackage 
    

# runtime
FROM --platform=linux/amd64 gcr.io/distroless/java25-debian13:nonroot
# The TweetyProject web server expects /app/logs to exist,
# even if we override the logging config and thus making the path unused.
WORKDIR /app/logs
WORKDIR /app
COPY /deployment/backend/logback.xml ./logback.xml
COPY --from=build /build/org-tweetyproject-web/target/web-*.jar ./web.jar
CMD ["/app/web.jar", " --logging.config=/app/logback.xml"]