package com.viveros.tienda.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.viveros.tienda.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

	// Cada filtro es opcional: si llega null (o false en soloDisponibles) no se aplica.
	@Query("""
			select p from Producto p left join fetch p.deporte d
			where (:deporteId is null or d.id = :deporteId)
			  and (:tipo is null or p.tipo = :tipo)
			  and (:soloDisponibles = false or p.disponible = true)
			  and (:q is null
			       or lower(p.nombre) like lower(concat('%', :q, '%'))
			       or lower(p.descripcion) like lower(concat('%', :q, '%')))
			order by p.destacado desc, p.nombre asc
			""")
	List<Producto> buscar(@Param("deporteId") Long deporteId,
			@Param("tipo") String tipo,
			@Param("soloDisponibles") boolean soloDisponibles,
			@Param("q") String q);

	@Query("select distinct p.tipo from Producto p order by p.tipo")
	List<String> tipos();

}
