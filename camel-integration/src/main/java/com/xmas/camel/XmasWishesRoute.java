package com.xmas.camel;

import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;

public class XmasWishesRoute extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        // Route definition: Scans to MongoDB
        from("file:/scans?noop=true")
                .log("Processing file: ${header.CamelFileName}")
                .to("mongodb:myDb?database=xmas_wishes&collection=scans&operation=insert");
    }

    public static void main(String[] args) {
        // Create a CamelContext instance
        CamelContext context = new DefaultCamelContext();

        try {
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
