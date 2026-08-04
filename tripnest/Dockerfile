# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Milestone 3: Create the uploads directory inside the container.
# Docker will mount the named volume (uploads_data) here at runtime,
# preserving uploaded travel documents across container restarts.
RUN mkdir -p /uploads

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
