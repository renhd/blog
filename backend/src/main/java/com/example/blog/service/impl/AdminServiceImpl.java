package com.example.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.blog.entity.Admin;
import com.example.blog.mapper.AdminMapper;
import com.example.blog.service.AdminService;
import com.example.blog.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AdminMapper adminMapper;

    @Autowired
    private JwtUtils jwtUtils;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public Admin findByUsername(String username) {
        QueryWrapper<Admin> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        return adminMapper.selectOne(queryWrapper);
    }

    @Override
    public Admin createAdmin(Admin admin) {
        // 加密密码
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setStatus(1); // 默认启用
        admin.setRole("admin"); // 默认管理员角色
        adminMapper.insert(admin);
        return admin;
    }

    @Override
    public Admin updateAdmin(Admin admin) {
        adminMapper.updateById(admin);
        return admin;
    }

    @Override
    public boolean deleteAdmin(Long id) {
        return adminMapper.deleteById(id) > 0;
    }

    @Override
    public String login(String username, String password) {
        Admin admin = findByUsername(username);
        if (admin == null) {
            return null;
        }
        
        // 检查账户状态
        if (admin.getStatus() == 0) {
            return null;
        }
        
        // 验证密码
        if (!passwordEncoder.matches(password, admin.getPassword())) {
            return null;
        }
        
        // 生成JWT token
        return jwtUtils.generateToken(admin.getUsername(), admin.getId());
    }

    @Override
    public Admin getCurrentAdmin(Long adminId) {
        if (adminId == null) {
            return null;
        }
        return adminMapper.selectById(adminId);
    }

    @Override
    public boolean changePassword(Long adminId, String oldPassword, String newPassword) {
        Admin admin = adminMapper.selectById(adminId);
        if (admin == null) {
            return false;
        }
        
        // 验证旧密码
        if (!passwordEncoder.matches(oldPassword, admin.getPassword())) {
            return false;
        }
        
        // 更新密码
        admin.setPassword(passwordEncoder.encode(newPassword));
        return adminMapper.updateById(admin) > 0;
    }
}