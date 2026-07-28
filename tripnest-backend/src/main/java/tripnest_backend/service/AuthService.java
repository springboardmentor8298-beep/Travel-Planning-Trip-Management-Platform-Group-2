package tripnest_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tripnest_backend.dto.LoginRequest;
import tripnest_backend.dto.MessageResponse;
import tripnest_backend.dto.SignupRequest;
import tripnest_backend.entity.User;
import tripnest_backend.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public MessageResponse registerUser(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return new MessageResponse("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole("USER");

        userRepository.save(user);
        return new MessageResponse("User Registered Successfully");
    }

    public MessageResponse loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return new MessageResponse("User Not Found");
        }

        if (!user.getPassword().equals(request.getPassword())) {
            return new MessageResponse("Invalid Password");
        }

        return new MessageResponse("Login Successful");
    }
}
