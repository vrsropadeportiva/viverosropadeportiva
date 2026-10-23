package com.viveros.tienda.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Deporte {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;

	@Column(nullable = false, unique = true, length = 60)
	public String nombre;

	public Deporte() {
	}

	public Deporte(String nombre) {
		this.nombre = nombre;
	}

}
