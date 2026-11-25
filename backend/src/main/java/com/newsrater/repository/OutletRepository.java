package com.newsrater.repository;

import com.newsrater.model.Outlet;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OutletRepository extends JpaRepository<Outlet, Long> {

    Optional<Outlet> findByDomain(String domain);
}
