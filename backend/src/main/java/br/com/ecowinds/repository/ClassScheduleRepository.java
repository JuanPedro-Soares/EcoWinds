package br.com.ecowinds.repository;

import br.com.ecowinds.model.ClassSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Long> {

    @Query("SELECT cs FROM ClassSchedule cs WHERE " +
            "LOWER(cs.course) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(cs.room.identification) LIKE LOWER(CONCAT('%', :searchTerm, '%'))"
    )
    Page<ClassSchedule> search(
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
