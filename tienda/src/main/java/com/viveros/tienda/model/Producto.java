package com.viveros.tienda.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Producto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;

	@Column(nullable = false, length = 120)
	public String nombre;

	@Column(length = 1000)
	public String descripcion;

	// Camiseta, Uniforme completo, Pantaloneta, Accesorio...
	@Column(nullable = false, length = 40)
	public String tipo;

	@ManyToOne(fetch = FetchType.EAGER)
	public Deporte deporte;

	// Pesos colombianos. null = "Precio por cotización".
	public Integer precio;

	public boolean disponible = true;

	public boolean destacado;

	public String imagenUrl;

	// Opcional, separados por comas: "Verde y amarillo,Azul y blanco"
	@Column(length = 300)
	public String colores;

}
