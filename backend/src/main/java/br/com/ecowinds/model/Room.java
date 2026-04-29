package br.com.ecowinds.model;

import br.com.ecowinds.model.enums.RoomStatus;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "rooms")
public class Room extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String identification;

    @Column(nullable = false)
    private String block;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status;

    @OneToOne(mappedBy = "room", cascade = CascadeType.ALL)
    private EspDevice espDevice;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClassSchedule> schedules = new ArrayList<>();


    public Room() {
    }

    public Room(String identification, String block, RoomStatus status, EspDevice espDevice, List<ClassSchedule> schedules) {
        this.identification = identification;
        this.block = block;
        this.status = status;
        this.espDevice = espDevice;
        this.schedules = schedules;
    }

    public String getIdentification() {
        return identification;
    }

    public void setIdentification(String identification) {
        this.identification = identification;
    }

    public String getBlock() {
        return block;
    }

    public void setBlock(String block) {
        this.block = block;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }

    public EspDevice getEspDevice() {
        return espDevice;
    }

    public void setEspDevice(EspDevice espDevice) {
        this.espDevice = espDevice;
    }

    public List<ClassSchedule> getSchedules() {
        return schedules;
    }

    public void setSchedules(List<ClassSchedule> schedules) {
        this.schedules = schedules;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Room room = (Room) o;
        return Objects.equals(getIdentification(), room.getIdentification()) && Objects.equals(getBlock(), room.getBlock()) && getStatus() == room.getStatus() && Objects.equals(getEspDevice(), room.getEspDevice()) && Objects.equals(getSchedules(), room.getSchedules());
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), getIdentification(), getBlock(), getStatus(), getEspDevice(), getSchedules());
    }
}
