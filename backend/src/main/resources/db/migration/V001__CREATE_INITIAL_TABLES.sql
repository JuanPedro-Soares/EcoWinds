CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(255) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       role VARCHAR(50) NOT NULL,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP
);

CREATE TABLE rooms (
                       id BIGSERIAL PRIMARY KEY,
                       identification VARCHAR(255) NOT NULL UNIQUE,
                       block VARCHAR(255) NOT NULL,
                       status VARCHAR(50) NOT NULL,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP
);

CREATE TABLE esp_devices (
                             id BIGSERIAL PRIMARY KEY,
                             mac_address VARCHAR(255) NOT NULL UNIQUE,
                             ip_address VARCHAR(255) NOT NULL,
                             connection_status BOOLEAN NOT NULL DEFAULT FALSE,
                             infrared_frequency VARCHAR(255) NOT NULL,
                             room_id BIGINT UNIQUE,
                             created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP,
                             CONSTRAINT fk_esp_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE class_schedules (
                                 id BIGSERIAL PRIMARY KEY,
                                 day_of_week VARCHAR(20) NOT NULL,
                                 start_time TIME NOT NULL,
                                 end_time TIME NOT NULL,
                                 course VARCHAR(255) NOT NULL,
                                 room_id BIGINT NOT NULL,
                                 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP,
                                 CONSTRAINT fk_schedule_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
                            id BIGSERIAL PRIMARY KEY,
                            timestamp TIMESTAMP NOT NULL,
                            action VARCHAR(255) NOT NULL,
                            origin VARCHAR(255) NOT NULL,
                            user_id BIGINT,
                            room_id BIGINT,
                            esp_device_id BIGINT,
                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP,
                            CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                            CONSTRAINT fk_log_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
                            CONSTRAINT fk_log_esp FOREIGN KEY (esp_device_id) REFERENCES esp_devices(id) ON DELETE SET NULL
);