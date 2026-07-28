package tripnest_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import tripnest_backend.dto.LoginRequest;
import tripnest_backend.dto.MessageResponse;
import tripnest_backend.dto.SignupRequest;
import tripnest_backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public MessageResponse signup(@RequestBody SignupRequest request) {
        return authService.registerUser(request);
    }

    @PostMapping("/login")
    public MessageResponse login(@RequestBody LoginRequest request) {
        return authService.loginUser(request);
    }
}
