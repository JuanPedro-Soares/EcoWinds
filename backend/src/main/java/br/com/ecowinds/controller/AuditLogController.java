package br.com.ecowinds.controller;

import br.com.ecowinds.dto.auditLog.AuditLogDTO;
import br.com.ecowinds.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Audit Logs", description = "Endpoint for audit log management.")
@RestController
@RequestMapping("/audit-log")
@SecurityRequirement(name = "bearerAuth")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @Operation(summary = "Search for paginated audit logs", description = "Returns a list of audit logs filtered by action, origin, user, room or device.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully."),
            @ApiResponse(responseCode = "401", description = "Unauthenticated user"),
            @ApiResponse(responseCode = "403", description = "No permission to access this resource.")
    })
    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/search")
    public ResponseEntity<Page<AuditLogDTO>> search(
            @RequestParam(value = "search") String search,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
        return ResponseEntity.ok().body(auditLogService.searchPageable(search, page, size));
    }

    @Operation(summary = "Find audit log by ID", description = "Returns the details of a specific audit log using its unique identifier.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "AuditLog found successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "AuditLog not found")
    })
    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{id}")
    public ResponseEntity<AuditLogDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok().body(auditLogService.findById(id));
    }

    @Operation(summary = "Create a new audit log", description = "Registers a new audit log in the system based on the provided data.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "AuditLog created successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public ResponseEntity<AuditLogDTO> save(@RequestBody AuditLogDTO dto) {
        return ResponseEntity.ok().body(auditLogService.save(dto));
    }

    @Operation(summary = "Update an existing audit log", description = "Updates audit log details based on the provided ID and body data.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "AuditLog updated successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "AuditLog not found")
    })
    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/{id}")
    public ResponseEntity<AuditLogDTO> update(@PathVariable Long id, @RequestBody AuditLogDTO dto) {
        return ResponseEntity.ok(auditLogService.update(id, dto));
    }

    @Operation(summary = "Delete an audit log", description = "Permanently removes an audit log from the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "AuditLog deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "AuditLog not found")
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        auditLogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
