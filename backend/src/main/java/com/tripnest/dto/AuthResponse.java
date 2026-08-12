package com.tripnest.dto;

public class AuthResponse {
    private String  token;
    private Long    userId;
    private String  fullName;
    private String  email;
    private String  role;
    private boolean emailVerified;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String fullName,
                        String email, String role, boolean emailVerified) {
        this.token         = token;
        this.userId        = userId;
        this.fullName      = fullName;
        this.email         = email;
        this.role          = role;
        this.emailVerified = emailVerified;
    }

    /** Backwards-compat constructor (emailVerified defaults false) */
    public AuthResponse(String token, Long userId, String fullName, String email, String role) {
        this(token, userId, fullName, email, role, false);
    }

    public String  getToken()                              { return token; }
    public void    setToken(String token)                  { this.token = token; }
    public Long    getUserId()                             { return userId; }
    public void    setUserId(Long userId)                  { this.userId = userId; }
    public String  getFullName()                           { return fullName; }
    public void    setFullName(String fullName)            { this.fullName = fullName; }
    public String  getEmail()                              { return email; }
    public void    setEmail(String email)                  { this.email = email; }
    public String  getRole()                               { return role; }
    public void    setRole(String role)                    { this.role = role; }
    public boolean isEmailVerified()                       { return emailVerified; }
    public void    setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
}
