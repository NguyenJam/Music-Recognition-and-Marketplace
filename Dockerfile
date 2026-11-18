FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --chown=10001:10001 server/build/libs/server-0.1.0.jar /app/melodex.jar
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/melodex.jar"]
