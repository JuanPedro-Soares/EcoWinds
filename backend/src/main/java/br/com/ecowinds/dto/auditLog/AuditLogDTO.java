package br.com.ecowinds.dto.auditLog;

import br.com.ecowinds.model.AuditLog;

import java.time.LocalDateTime;

public record AuditLogDTO(
        Long id,
        LocalDateTime timestamp,
        String action,
        String origin,
        Long userId,
        Long roomId,
        Long espDeviceId
) {
    public AuditLogDTO(AuditLog auditLog) {
        this(
                auditLog.getId(),
                auditLog.getTimestamp(),
                auditLog.getAction(),
                auditLog.getOrigin(),
                auditLog.getUser() != null ? auditLog.getUser().getId() : null,
                auditLog.getRoom() != null ? auditLog.getRoom().getId() : null,
                auditLog.getEspDevice() != null ? auditLog.getEspDevice().getId() : null
        );
    }
}
