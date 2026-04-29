package br.com.ecowinds.repository;

import br.com.ecowinds.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog,Long> {

    @Query("SELECT al FROM AuditLog al " +
            "LEFT JOIN al.user u " +
            "LEFT JOIN al.room r " +
            "LEFT JOIN al.espDevice ed " +
            "WHERE LOWER(al.action) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(al.origin) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(r.identification) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(ed.ipAddress) LIKE LOWER(CONCAT('%', :searchTerm, '%'))"
    )
    Page<AuditLog> search(
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
