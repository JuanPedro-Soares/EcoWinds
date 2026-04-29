package br.com.ecowinds.service;

import br.com.ecowinds.dto.room.RoomDTO;
import br.com.ecowinds.model.Room;
import br.com.ecowinds.repository.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public Page<RoomDTO> searchPageable(String searchTerm, int page, int size) {
        String term = (searchTerm == null) ? "" : searchTerm;
        Pageable pageable = PageRequest.of(page, size, Sort.by("identification").ascending());

        return roomRepository.search(searchTerm, pageable).map(RoomDTO::new);
    }

    @Transactional(readOnly = true)
    public RoomDTO findById(Long id) {
        return roomRepository.findById(id)
                .map(RoomDTO::new)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));
    }

    @Transactional
    public RoomDTO save(RoomDTO dto) {
        Room room = new Room();
        DtoToEntity(dto, room);

        return new RoomDTO(roomRepository.save(room));
    }

    @Transactional
    public RoomDTO update(Long id, RoomDTO dto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));

        DtoToEntity(dto, room);
        return new RoomDTO(roomRepository.save(room));
    }

    @Transactional
    public void delete(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new EntityNotFoundException("Room not found");
        }

        roomRepository.deleteById(id);
    }

    private void DtoToEntity(RoomDTO dto, Room entity) {
        entity.setIdentification(dto.identification());
        entity.setBlock(dto.block());
        entity.setStatus(dto.status());
    }
}
