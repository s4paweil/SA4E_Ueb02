package com.xmas.camel;

import org.apache.camel.builder.RouteBuilder;
import org.bson.Document;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Paths;

@Component
public class XmasWishesRoute extends RouteBuilder {
    @Override
    public void configure() throws Exception {
        from("file:/scanned_letters?noop=true") // Überwachung des Ordners
                .routeId("file-to-mongo")
                .log("Neue Datei entdeckt: ${header.CamelFileName}")
                .process(exchange -> {
                    String filename = exchange.getIn().getHeader("CamelFileName", String.class);
                    byte[] fileContent = Files.readAllBytes(Paths.get(exchange.getIn().getBody(String.class)));

                    // MongoDB-Dokument erstellen
                    Document document = new Document();
                    document.put("filename", filename);
                    document.put("content", fileContent);
                    document.put("timestamp", System.currentTimeMillis());

                    exchange.getIn().setBody(document);
                })
                .to("mongodb:myDb?database=xmas_wishes&collection=scanned_wishes&operation=insert")
                .log("Datei erfolgreich in MongoDB gespeichert: ${header.CamelFileName}");
    }
}
