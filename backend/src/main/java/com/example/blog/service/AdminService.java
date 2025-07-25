package com.example.blog.service;

import com.example.blog.entity.Admin;

public interface AdminService {
    
    Admin findByUsername(String username);
    
    Admin createAdmin(Admin admin);
    
    Admin updateAdmin(Admin admin);
    
    boolean deleteAdmin(Long id);
    
    String login(String username, String password);
    
    Admin getCurrentAdmin(Long adminId);
    
    boolean changePassword(Long adminId, String oldPassword, String newPassword);
}