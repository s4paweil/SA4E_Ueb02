package com.xmas.camel;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;
import org.bson.Document;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Date;

public class XmasWishesRoute extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        // Route definition: Read scanned wishes from /scans and store them in MongoDB
        from("file:///scans?noop=true")
                .process(exchange -> {
                    // Read file content as String
                    String filePath = exchange.getIn().getHeader("CamelFilePath", String.class);
                    String fileContent = new String(Files.readAllBytes(Paths.get(filePath)));

                    // Parse the file content to extract name and wish
                    String[] lines = fileContent.split("\n");
                    String name = lines.length > 0 ? lines[0].trim() : "Unknown";
                    String wish = lines.length > 1 ? lines[1].trim() : "No wish provided";

                    // Create MongoDB document
                    Document document = new Document();
                    document.put("name", name);
                    document.put("wish", wish);
                    document.put("status", "formuliert");
                    document.put("timestamp", new Date());

                    exchange.getIn().setBody(document);
                })
                .to("mongodb:myDb?database=xmas_wishes&collection=wishes&operation=insert")
                .log("Wish from ${header.CamelFileName} saved to MongoDB.");
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
            System.out.println("Camel Context started. Press Ctrl+C to exit.");

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
