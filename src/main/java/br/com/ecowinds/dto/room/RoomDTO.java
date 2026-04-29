package br.com.ecowinds.dto.room;

import br.com.ecowinds.model.Room;
import br.com.ecowinds.model.enums.RoomStatus;

public record RoomDTO(
        Long id,
        String identification,
        String block,
        RoomStatus status
) {
    public RoomDTO(Room room) {
        this(room.getId(), room.getIdentification(), room.getBlock(), room.getStatus());
    }
}
