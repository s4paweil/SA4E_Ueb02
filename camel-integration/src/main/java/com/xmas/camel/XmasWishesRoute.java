package com.xmas.camel;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;
import org.bson.Document;

import java.io.File;
import java.nio.file.Files;
import java.util.Base64;
import java.util.Date;

public class XmasWishesRoute extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        // Route definition: Scans to MongoDB
        from("file:///scans?noop=true")
                .process(exchange -> {
                    // Dateiinhalt lesen und Base64-kodieren
                    File file = exchange.getIn().getBody(File.class);
                    byte[] fileContent = Files.readAllBytes(file.toPath());
                    String base64Encoded = Base64.getEncoder().encodeToString(fileContent);

                    // MongoDB-Dokument erstellen
                    Document document = new Document()
                            .append("filename", file.getName())
                            .append("content", base64Encoded)
                            .append("timestamp", new Date());

                    exchange.getIn().setBody(document);
                })
                .to("mongodb:myDb?database=xmas_wishes&collection=scans&operation=insert")
                .log("Datei ${header.CamelFileName} wurde in MongoDB gespeichert.");
    }

    public static void main(String[] args) {
        // Create a CamelContext instance
        CamelContext context = new DefaultCamelContext();

        try {
            // Create MongoDB client
            MongoClient mongoClient = MongoClients.create("mongodb://mongo:27017");
            // Register the MongoClient in the Camel context
            context.getRegistry().bind("myDb", mongoClient);

            // Add the route to the context
            context.addRoutes(new XmasWishesRoute());

            // Start the context
            context.start();
            System.out.println("Camel Context gestartet. Drücken Sie Strg+C, um zu beenden.");

            // Keep the application running
            Thread.sleep(Long.MAX_VALUE);

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                context.stop();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
