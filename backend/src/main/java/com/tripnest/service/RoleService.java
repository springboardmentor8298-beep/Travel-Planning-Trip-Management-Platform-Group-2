package com.tripnest.service;

import com.tripnest.entity.Role;
import com.tripnest.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    // Get all roles
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    // Get role by ID
    public Optional<Role> getRoleById(Integer id) {
        return roleRepository.findById(id);
    }

    // Save a new role
    public Role saveRole(Role role) {
        return roleRepository.save(role);
    }

    // Update role
    public Role updateRole(Role role) {
        return roleRepository.save(role);
    }

    // Delete role
    public void deleteRole(Integer id) {
        roleRepository.deleteById(id);
    }
}