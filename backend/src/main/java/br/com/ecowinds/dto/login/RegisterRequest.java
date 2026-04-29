package br.com.ecowinds.dto.login;

import br.com.ecowinds.model.enums.UserRole;

public record RegisterRequest(String name, String email, String password, UserRole role) { }
