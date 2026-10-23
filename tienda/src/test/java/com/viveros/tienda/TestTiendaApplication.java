package com.viveros.tienda;

import org.springframework.boot.SpringApplication;

// Arranca la tienda con la base H2 de pruebas: mvnw spring-boot:test-run
public class TestTiendaApplication {

	public static void main(String[] args) {
		SpringApplication.from(TiendaApplication::main).run(args);
	}

}
