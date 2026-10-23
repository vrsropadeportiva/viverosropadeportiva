package com.viveros.tienda.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.viveros.tienda.model.Deporte;
import com.viveros.tienda.model.Diseno;
import com.viveros.tienda.model.Producto;
import com.viveros.tienda.repository.DeporteRepository;
import com.viveros.tienda.repository.DisenoRepository;
import com.viveros.tienda.repository.ProductoRepository;

@RestController
@RequestMapping("/api")
public class CatalogoController {

	private final ProductoRepository productos;
	private final DisenoRepository disenos;
	private final DeporteRepository deportes;

	public CatalogoController(ProductoRepository productos, DisenoRepository disenos, DeporteRepository deportes) {
		this.productos = productos;
		this.disenos = disenos;
		this.deportes = deportes;
	}

	@GetMapping("/productos")
	public List<Producto> productos(
			@RequestParam(required = false) Long deporte,
			@RequestParam(required = false) String tipo,
			@RequestParam(defaultValue = "false") boolean soloDisponibles,
			@RequestParam(required = false) String q) {
		return productos.buscar(deporte, vacioANull(tipo), soloDisponibles, vacioANull(q));
	}

	@GetMapping("/productos/{id}")
	public ResponseEntity<Producto> producto(@PathVariable Long id) {
		return ResponseEntity.of(productos.findById(id));
	}

	@GetMapping("/tipos")
	public List<String> tipos() {
		return productos.tipos();
	}

	@GetMapping("/disenos")
	public List<Diseno> disenos(@RequestParam(defaultValue = "false") boolean masVendidos) {
		return masVendidos
				? disenos.findByMasVendidoTrueOrderByNombreAsc()
				: disenos.findAllByOrderByDeporteNombreAscNombreAsc();
	}

	@GetMapping("/deportes")
	public List<Deporte> deportes() {
		return deportes.findAllByOrderByNombreAsc();
	}

	private static String vacioANull(String valor) {
		return valor == null || valor.isBlank() ? null : valor.trim();
	}

}
