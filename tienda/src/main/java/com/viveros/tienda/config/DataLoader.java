package com.viveros.tienda.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.viveros.tienda.model.Deporte;
import com.viveros.tienda.model.Diseno;
import com.viveros.tienda.model.Producto;
import com.viveros.tienda.repository.DeporteRepository;
import com.viveros.tienda.repository.DisenoRepository;
import com.viveros.tienda.repository.ProductoRepository;

// Carga datos de ejemplo solo si la base está vacía.
@Component
public class DataLoader implements CommandLineRunner {

	private final DeporteRepository deportes;
	private final ProductoRepository productos;
	private final DisenoRepository disenos;

	public DataLoader(DeporteRepository deportes, ProductoRepository productos, DisenoRepository disenos) {
		this.deportes = deportes;
		this.productos = productos;
		this.disenos = disenos;
	}

	@Override
	@Transactional
	public void run(String... args) {
		if (deportes.count() > 0) {
			return;
		}

		Deporte futbol = deportes.save(new Deporte("Fútbol"));
		Deporte micro = deportes.save(new Deporte("Microfútbol"));
		Deporte baloncesto = deportes.save(new Deporte("Baloncesto"));
		Deporte voleibol = deportes.save(new Deporte("Voleibol"));
		Deporte ciclismo = deportes.save(new Deporte("Ciclismo"));

		productos.saveAll(List.of(
				// Fútbol
				producto("Camiseta de fútbol Pro", "Tela dry-fit sublimada, cuello en V. Nombre y número incluidos.",
						"Camiseta", futbol, 85000, true, true, "Verde y amarillo,Azul y blanco,Rojo y negro", "/img/diseno-1.svg"),
				producto("Uniforme completo de fútbol", "Camiseta, pantaloneta y medias. Diseño 100 % personalizado.",
						"Uniforme completo", futbol, 145000, true, true, "Negro y lima,Blanco y azul,Vinotinto y dorado", null),
				producto("Pantaloneta de fútbol", "Liviana, con resorte y cordón. Sublimada a juego con tu camiseta.",
						"Pantaloneta", futbol, 38000, true, false, "Negro,Blanco,Azul", null),
				producto("Camiseta de arquero manga larga", "Acolchado en codos, tela de alto rendimiento.",
						"Camiseta", futbol, null, false, false, "Naranja y negro,Gris y lima", null),
				// Microfútbol
				producto("Camiseta de microfútbol", "Corte ajustado y tela respirable para cancha sintética.",
						"Camiseta", micro, 75000, true, false, "Azul y blanco,Morado y lima", null),
				producto("Uniforme de microfútbol para equipos", "Paquete para equipo: camiseta y pantaloneta. Precio según cantidad.",
						"Uniforme completo", micro, null, true, true, "Rojo y blanco,Negro y naranja", null),
				producto("Pantaloneta de microfútbol", "Bolsillos laterales y tela antitranspirante.",
						"Pantaloneta", micro, 35000, true, false, "Negro,Rojo", null),
				// Baloncesto
				producto("Camiseta de baloncesto", "Esqueleto sublimado con sisas amplias.",
						"Camiseta", baloncesto, 80000, true, true, "Morado y amarillo,Rojo y negro,Celeste y blanco", "/img/diseno-3.svg"),
				producto("Uniforme de baloncesto completo", "Esqueleto y pantaloneta larga a juego.",
						"Uniforme completo", baloncesto, 150000, true, false, "Negro y lima,Azul y naranja", null),
				producto("Pantaloneta de baloncesto", "Larga, con franjas laterales personalizables.",
						"Pantaloneta", baloncesto, 45000, false, false, "Negro,Morado", null),
				// Voleibol
				producto("Camiseta de voleibol", "Manga corta, tela elástica de cuatro vías.",
						"Camiseta", voleibol, 72000, true, false, "Celeste y blanco,Rosado y negro", "/img/diseno-2.svg"),
				producto("Uniforme de voleibol", "Camiseta y licra o pantaloneta. Diseño de tu club.",
						"Uniforme completo", voleibol, null, true, false, "Amarillo y azul,Verde y blanco", null),
				// Ciclismo
				producto("Jersey de ciclismo", "Cremallera completa, tres bolsillos traseros y bandas de silicona.",
						"Camiseta", ciclismo, 125000, true, true, "Lima y negro,Rojo y blanco,Azul y amarillo", null),
				producto("Badana de ciclismo", "Con almohadilla de gel y tirantes. Talla a medida.",
						"Pantaloneta", ciclismo, null, true, false, "Negro", null),
				// Accesorios
				producto("Balón de fútbol N.° 5", "Cosido a máquina, ideal para entrenamiento en grama.",
						"Accesorio", futbol, 65000, true, false, null, null),
				producto("Balón de microfútbol", "Bote bajo, para cancha sintética o cemento.",
						"Accesorio", micro, 60000, true, false, null, null),
				producto("Guantes de arquero", "Palma en látex y cierre con velcro.",
						"Accesorio", futbol, 55000, true, true, "Negro y lima,Blanco y azul", null),
				producto("Canilleras", "Livianas, con funda de tela. Tallas S, M y L.",
						"Accesorio", futbol, 25000, true, false, null, null),
				producto("Gorra deportiva bordada", "Gorra con el escudo de tu equipo bordado. Pedido mínimo 12 unidades.",
						"Accesorio", null, null, true, false, "Negro,Blanco,Azul", null),
				producto("Medias deportivas", "Media larga antideslizante a juego con tu uniforme.",
						"Accesorio", null, 15000, false, false, "Blanco,Negro,Rojo", null)));

		disenos.saveAll(List.of(
				new Diseno("Furia Lima", futbol, "/img/diseno-1.svg", true),
				new Diseno("Marea Azul", voleibol, "/img/diseno-2.svg", true),
				new Diseno("Fuego Urbano", baloncesto, "/img/diseno-3.svg", true),
				new Diseno("Clásico Cafetero", futbol, null, false),
				new Diseno("Relámpago", micro, null, false),
				new Diseno("Montaña Quindiana", ciclismo, null, false)));
	}

	private static Producto producto(String nombre, String descripcion, String tipo, Deporte deporte, Integer precio,
			boolean disponible, boolean destacado, String colores, String imagenUrl) {
		Producto p = new Producto();
		p.nombre = nombre;
		p.descripcion = descripcion;
		p.tipo = tipo;
		p.deporte = deporte;
		p.precio = precio;
		p.disponible = disponible;
		p.destacado = destacado;
		p.colores = colores;
		p.imagenUrl = imagenUrl;
		return p;
	}

}
