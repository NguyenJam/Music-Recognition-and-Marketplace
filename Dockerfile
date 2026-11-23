FROM eclipse-temurin:21-jdk AS build

WORKDIR /workspace
COPY gradlew settings.gradle build.gradle gradle.properties ./
COPY gradle ./gradle
COPY server ./server
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew && ./gradlew --no-daemon :server:bootJar

FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --from=build --chown=10001:10001 /workspace/server/build/libs/server-0.1.0.jar /app/melodex.jar
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-jar", "/app/melodex.jar"]
