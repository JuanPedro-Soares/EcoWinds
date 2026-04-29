package br.com.ecowinds.repository;

import br.com.ecowinds.model.EspDevice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EspDeviceRepository extends JpaRepository<EspDevice, Long> {

    @Query("SELECT ed FROM EspDevice ed WHERE " +
            "LOWER(ed.ipAddress) LIKE LOWER(CONCAT('%', :searchTerm, '%'))"
    )
    Page<EspDevice> search(
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
