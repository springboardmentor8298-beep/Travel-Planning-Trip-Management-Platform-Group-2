# Stage 1: Build stage with Maven and OpenJDK 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Runtime environment
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/target/tripnest-backend-*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=postgres

ENTRYPOINT ["java", "-jar", "app.jar"]
