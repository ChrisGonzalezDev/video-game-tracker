FROM maven:3.9.9-eclipse-temurin-17-alpine AS build

WORKDIR /workspace

COPY pom.xml ./
COPY src src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre-alpine

RUN apk add --no-cache curl
WORKDIR /app

COPY --from=build /workspace/target/video-game-tracker-backend-0.1.0-SNAPSHOT.jar app.jar

EXPOSE 8080
HEALTHCHECK --interval=5s --timeout=3s --start-period=30s --retries=12 \
    CMD curl --fail --silent http://127.0.0.1:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
