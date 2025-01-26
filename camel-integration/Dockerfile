FROM openjdk:17-jdk-slim
COPY target/camel-integration.jar /app/camel-integration.jar
WORKDIR /app
CMD ["java", "-jar", "camel-integration.jar"]
