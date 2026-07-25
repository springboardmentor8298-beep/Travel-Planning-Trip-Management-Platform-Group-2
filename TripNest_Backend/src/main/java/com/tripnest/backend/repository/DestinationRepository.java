package com.tripnest.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.backend.entity.Destination;

public interface DestinationRepository extends JpaRepository<Destination,Long>{

}
