package com.viveros.tienda.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.viveros.tienda.model.Diseno;

public interface DisenoRepository extends JpaRepository<Diseno, Long> {

	List<Diseno> findAllByOrderByDeporteNombreAscNombreAsc();

	List<Diseno> findByMasVendidoTrueOrderByNombreAsc();

}
