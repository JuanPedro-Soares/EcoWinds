package br.com.ecowinds.controller;

import br.com.ecowinds.dto.room.RoomDTO;
import br.com.ecowinds.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Rooms", description = "Endpoint for classroom and block management.")
@RestController
@RequestMapping("/room")
@SecurityRequirement(name = "bearerAuth")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @Operation(summary = "Search for paginated rooms", description = "Returns a list of rooms filtered by name or block, sorted by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully."),
            @ApiResponse(responseCode = "401", description = "Unauthenticated user"),
            @ApiResponse(responseCode = "403", description = "No permission to access this resource.")
    })
    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/search")
    public ResponseEntity<Page<RoomDTO>> search(
            @RequestParam(value = "search") String search,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
       return ResponseEntity.ok().body(roomService.searchPageable(search, page, size));
    }

    @Operation(summary = "Find room by ID", description = "Returns the details of a specific room using its unique identifier.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Room found successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Room not found")
    })
    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{id}")
    public ResponseEntity<RoomDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok().body(roomService.findById(id));
    }

    @Operation(summary = "Create a new room", description = "Registers a new room in the system based on the provided data.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Room created successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public ResponseEntity<RoomDTO> save(@RequestBody RoomDTO dto) {
        return ResponseEntity.ok().body(roomService.save(dto));
    }

    @Operation(summary = "Update an existing room", description = "Updates room details based on the provided ID and body data.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Room updated successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Room not found")
    })
    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/{id}")
    public ResponseEntity<RoomDTO> update(@PathVariable Long id, @RequestBody RoomDTO dto) {
        return ResponseEntity.ok(roomService.update(id, dto));
    }

    @Operation(summary = "Delete a room", description = "Permanently removes a room from the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Room deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Room not found")
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
