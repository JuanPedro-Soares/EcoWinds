package br.com.ecowinds.service;

import br.com.ecowinds.dto.auditLog.AuditLogDTO;
import br.com.ecowinds.model.AuditLog;
import br.com.ecowinds.model.EspDevice;
import br.com.ecowinds.model.Room;
import br.com.ecowinds.model.User;
import br.com.ecowinds.repository.AuditLogRepository;
import br.com.ecowinds.repository.EspDeviceRepository;
import br.com.ecowinds.repository.RoomRepository;
import br.com.ecowinds.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final EspDeviceRepository espDeviceRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository,
                           RoomRepository roomRepository, EspDeviceRepository espDeviceRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.espDeviceRepository = espDeviceRepository;
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDTO> searchPageable(String searchTerm, int page, int size) {
        String term = (searchTerm == null) ? "" : searchTerm;
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").ascending());

        return auditLogRepository.search(term, pageable).map(AuditLogDTO::new);
    }

    @Transactional(readOnly = true)
    public AuditLogDTO findById(Long id) {
        return auditLogRepository.findById(id)
                .map(AuditLogDTO::new)
                .orElseThrow(() -> new EntityNotFoundException("AuditLog not found"));
    }

    @Transactional
    public AuditLogDTO save(AuditLogDTO dto) {
        AuditLog auditLog = new AuditLog();
        DtoToEntity(dto, auditLog);

        return new AuditLogDTO(auditLogRepository.save(auditLog));
    }

    @Transactional
    public AuditLogDTO update(Long id, AuditLogDTO dto) {
        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("AuditLog not found"));

        DtoToEntity(dto, auditLog);
        return new AuditLogDTO(auditLogRepository.save(auditLog));
    }

    @Transactional
    public void delete(Long id) {
        if (!auditLogRepository.existsById(id)) {
            throw new EntityNotFoundException("AuditLog not found");
        }

        auditLogRepository.deleteById(id);
    }

    private void DtoToEntity(AuditLogDTO dto, AuditLog entity) {
        entity.setTimestamp(dto.timestamp());
        entity.setAction(dto.action());
        entity.setOrigin(dto.origin());

        if (dto.userId() != null) {
            User user = userRepository.findById(dto.userId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
            entity.setUser(user);
        }

        if (dto.roomId() != null) {
            Room room = roomRepository.findById(dto.roomId())
                    .orElseThrow(() -> new EntityNotFoundException("Room not found"));
            entity.setRoom(room);
        }

        if (dto.espDeviceId() != null) {
            EspDevice espDevice = espDeviceRepository.findById(dto.espDeviceId())
                    .orElseThrow(() -> new EntityNotFoundException("EspDevice not found"));
            entity.setEspDevice(espDevice);
        }
    }
}
