package com.xmas.camel;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;
import org.bson.Document;

import java.io.File;
import java.nio.file.Files;
import java.util.Date;

public class XmasWishesRoute extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        from("file:///scans?noop=true")
                .process(exchange -> {
                    // Lese Dateiinhalt und bereite JSON-Dokument vor
                    File file = exchange.getIn().getBody(File.class);
                    String content = Files.readString(file.toPath());

                    // MongoDB-Dokument erstellen
                    Document document = new Document()
                            .append("filename", file.getName())
                            .append("content", content)
                            .append("timestamp", new Date());

                    exchange.getIn().setBody(document);
                })
                .to("mongodb:myDb?database=xmas_wishes&collection=scans&operation=insert")
                .log("Datei ${header.CamelFileName} wurde in MongoDB gespeichert.");
    }

    public static void main(String[] args) {
        CamelContext context = new DefaultCamelContext();

        try {
            // MongoDB-Client erstellen
            MongoClient mongoClient = MongoClients.create("mongodb://mongo:27017");
            context.getRegistry().bind("myDb", mongoClient);

            // Route hinzufügen
            context.addRoutes(new XmasWishesRoute());

            // Kontext starten
            context.start();
            System.out.println("Camel Context gestartet. Drücken Sie Strg+C, um zu beenden.");
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
