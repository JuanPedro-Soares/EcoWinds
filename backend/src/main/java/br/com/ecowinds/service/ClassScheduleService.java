package br.com.ecowinds.service;

import br.com.ecowinds.dto.classSchedule.ClassScheduleDTO;
import br.com.ecowinds.model.ClassSchedule;
import br.com.ecowinds.model.Room;
import br.com.ecowinds.repository.ClassScheduleRepository;
import br.com.ecowinds.repository.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClassScheduleService {

    private final ClassScheduleRepository classScheduleRepository;
    private final RoomRepository roomRepository;

    public ClassScheduleService(ClassScheduleRepository classScheduleRepository, RoomRepository roomRepository) {
        this.classScheduleRepository = classScheduleRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public Page<ClassScheduleDTO> searchPageable(String searchTerm, int page, int size) {
        String term = (searchTerm == null) ? "" : searchTerm;
        Pageable pageable = PageRequest.of(page, size, Sort.by("course").ascending());

        return classScheduleRepository.search(term, pageable).map(ClassScheduleDTO::new);
    }

    @Transactional(readOnly = true)
    public ClassScheduleDTO findById(Long id) {
        return classScheduleRepository.findById(id)
                .map(ClassScheduleDTO::new)
                .orElseThrow(() -> new EntityNotFoundException("ClassSchedule not found"));
    }

    @Transactional
    public ClassScheduleDTO save(ClassScheduleDTO dto) {
        ClassSchedule classSchedule = new ClassSchedule();
        DtoToEntity(dto, classSchedule);

        return new ClassScheduleDTO(classScheduleRepository.save(classSchedule));
    }

    @Transactional
    public ClassScheduleDTO update(Long id, ClassScheduleDTO dto) {
        ClassSchedule classSchedule = classScheduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ClassSchedule not found"));

        DtoToEntity(dto, classSchedule);
        return new ClassScheduleDTO(classScheduleRepository.save(classSchedule));
    }

    @Transactional
    public void delete(Long id) {
        if (!classScheduleRepository.existsById(id)) {
            throw new EntityNotFoundException("ClassSchedule not found");
        }

        classScheduleRepository.deleteById(id);
    }

    private void DtoToEntity(ClassScheduleDTO dto, ClassSchedule entity) {
        entity.setDayOfWeek(dto.dayOfWeek());
        entity.setStartTime(dto.startTime());
        entity.setEndTime(dto.endTime());
        entity.setCourse(dto.course());

        if (dto.roomId() != null) {
            Room room = roomRepository.findById(dto.roomId())
                    .orElseThrow(() -> new EntityNotFoundException("Room not found"));
            entity.setRoom(room);
        }
    }
}
