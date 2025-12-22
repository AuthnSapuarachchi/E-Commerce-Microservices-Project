# 1. Use Java 21 (Alpine Linux version for speed)
FROM eclipse-temurin:21-jdk-alpine

# 2. Add a volume pointing to /tmp (Standard for Spring Boot)
VOLUME /tmp

# 3. Copy the built JAR file into the container
COPY target/*.jar app.jar

# 4. Command to run the app
ENTRYPOINT ["java","-jar","/app.jar"]