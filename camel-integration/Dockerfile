FROM openjdk:17-jdk-slim
COPY target/camel-integration-1.0-SNAPSHOT.jar /app/camel-integration.jar
WORKDIR /app
CMD ["java", "-jar", "camel-integration.jar"]
