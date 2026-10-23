package com.viveros.tienda.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.viveros.tienda.model.Deporte;

public interface DeporteRepository extends JpaRepository<Deporte, Long> {

	List<Deporte> findAllByOrderByNombreAsc();

}
