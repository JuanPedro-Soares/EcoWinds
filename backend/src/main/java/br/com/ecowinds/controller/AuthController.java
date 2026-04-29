package br.com.ecowinds.controller;

import br.com.ecowinds.dto.login.LoginRequest;
import br.com.ecowinds.dto.login.RegisterRequest;
import br.com.ecowinds.dto.login.TokenResponse;
import br.com.ecowinds.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "Endpoints for user authentication and registration.")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "User login", description = "Authenticates a user using email and password, returning a JWT token for API access.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful, token generated."),
            @ApiResponse(responseCode = "401", description = "Invalid credentials."),
            @ApiResponse(responseCode = "403", description = "Authentication blocked or forbidden.")
    })
    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        TokenResponse token = authService.login(loginRequest);
        return ResponseEntity.ok(token);
    }

    @Operation(summary = "Register a new user", description = "Registers a new user in the system based on the provided data. Fails if the email is already in use.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User successfully registered."),
            @ApiResponse(responseCode = "400", description = "Invalid data or email already in use.")
    })
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest registerRequest) {
        try {
            authService.register(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body("User successfully registered!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
