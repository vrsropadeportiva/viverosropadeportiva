package com.viveros.tienda.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Diseno {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;

	@Column(nullable = false, length = 120)
	public String nombre;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	public Deporte deporte;

	public String imagenUrl;

	public boolean masVendido;

	public Diseno() {
	}

	public Diseno(String nombre, Deporte deporte, String imagenUrl, boolean masVendido) {
		this.nombre = nombre;
		this.deporte = deporte;
		this.imagenUrl = imagenUrl;
		this.masVendido = masVendido;
	}

}
