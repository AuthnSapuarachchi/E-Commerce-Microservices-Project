# Start with a base Java image
FROM eclipse-temurin:21-jdk-alpine

# Copy the jar file from target folder to the container
# (We will rename it to app.jar to keep it simple)
COPY target/*.jar app.jar

# Run the jar file
ENTRYPOINT ["java", "-jar", "/app.jar"]