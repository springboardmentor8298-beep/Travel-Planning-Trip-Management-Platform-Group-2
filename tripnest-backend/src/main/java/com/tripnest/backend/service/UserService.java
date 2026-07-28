// package com.tripnest.backend.service;

// import com.tripnest.backend.dto.RegisterRequest;
// import com.tripnest.backend.entity.User;
// import com.tripnest.backend.repository.UserRepository;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;

// import com.tripnest.backend.security.JwtService;

// @Service
// public class UserServiceImpl implements UserService {


//     private final UserRepository userRepository;
//     private final PasswordEncoder passwordEncoder;
//     private final JwtService jwtService;

//     public interface UserService {

//     User register(RegisterRequest request);

//     String login(String email, String password);

// }


//     public UserService(UserRepository userRepository,PasswordEncoder passwordEncoder,
//                    JwtService jwtService) {

//         this.userRepository = userRepository;
//         this.passwordEncoder = passwordEncoder;
//         this.jwtService = jwtService;
//     }



//     public User register(RegisterRequest request){


//         User user = new User();

//         user.setName(request.getName());

//         user.setEmail(request.getEmail());


//         // Encrypt password
//         user.setPassword(
//                 passwordEncoder.encode(request.getPassword())
//         );


//         user.setRole(request.getRole());


//         return userRepository.save(user);
//     }

//     public String login(String email, String password){


//         User user = userRepository.findByEmail(email)
//             .orElseThrow(() -> 
//                 new RuntimeException("User not found")
//             );


//         if(passwordEncoder.matches(password, user.getPassword())){

//             return jwtService.generateToken(user.getEmail());

//     }


//     throw new RuntimeException("Invalid password");

// }
// }

package com.tripnest.backend.service;

import com.tripnest.backend.dto.LoginResponse;
import com.tripnest.backend.dto.RegisterRequest;
import com.tripnest.backend.entity.User;

public interface UserService {

    User register(RegisterRequest request);

   LoginResponse login(String email, String password);
}