package com.cloud.AWSbackenderrorcause.repository;

import com.cloud.AWSbackenderrorcause.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<Service, Long> {
}