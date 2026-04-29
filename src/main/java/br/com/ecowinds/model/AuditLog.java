package br.com.ecowinds.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "audit_logs")
public class AuditLog extends BaseEntity {

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String origin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "esp_device_id")
    private EspDevice espDevice;

    public AuditLog() {
    }

    public AuditLog(LocalDateTime timestamp, String action, String origin, User user, Room room, EspDevice espDevice) {
        this.timestamp = timestamp;
        this.action = action;
        this.origin = origin;
        this.user = user;
        this.room = room;
        this.espDevice = espDevice;
    }

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public EspDevice getEspDevice() {
        return espDevice;
    }

    public void setEspDevice(EspDevice espDevice) {
        this.espDevice = espDevice;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        AuditLog auditLog = (AuditLog) o;
        return Objects.equals(getTimestamp(), auditLog.getTimestamp()) && Objects.equals(getAction(), auditLog.getAction()) && Objects.equals(getOrigin(), auditLog.getOrigin()) && Objects.equals(getUser(), auditLog.getUser()) && Objects.equals(getRoom(), auditLog.getRoom()) && Objects.equals(getEspDevice(), auditLog.getEspDevice());
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), getTimestamp(), getAction(), getOrigin(), getUser(), getRoom(), getEspDevice());
    }
}
