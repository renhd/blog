package com.example.blog.controller;

import com.example.blog.common.Result;
import com.example.blog.entity.Admin;
import com.example.blog.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * 管理员登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        if (username == null || password == null) {
            return Result.error("用户名和密码不能为空");
        }

        String token = adminService.login(username, password);
        if (token == null) {
            return Result.error("用户名或密码错误");
        }

        Admin admin = adminService.findByUsername(username);
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("adminInfo", admin);

        return Result.success("登录成功", data);
    }

    /**
     * 获取当前管理员信息
     */
    @GetMapping("/info")
    public Result<Admin> getCurrentAdminInfo(HttpServletRequest request) {
        Long adminId = (Long) request.getAttribute("adminId");
        Admin admin = adminService.getCurrentAdmin(adminId);
        
        if (admin == null) {
            return Result.error("获取用户信息失败");
        }
        
        // 不返回密码
        admin.setPassword(null);
        return Result.success(admin);
    }

    /**
     * 修改密码
     */
    @PostMapping("/change-password")
    public Result<String> changePassword(@RequestBody Map<String, String> passwordData, HttpServletRequest request) {
        Long adminId = (Long) request.getAttribute("adminId");
        String oldPassword = passwordData.get("oldPassword");
        String newPassword = passwordData.get("newPassword");

        if (oldPassword == null || newPassword == null) {
            return Result.error("旧密码和新密码不能为空");
        }

        boolean success = adminService.changePassword(adminId, oldPassword, newPassword);
        if (success) {
            return Result.success("密码修改成功");
        } else {
            return Result.error("密码修改失败，请检查旧密码是否正确");
        }
    }

    /**
     * 更新管理员信息
     */
    @PutMapping("/profile")
    public Result<Admin> updateProfile(@RequestBody Admin admin, HttpServletRequest request) {
        Long adminId = (Long) request.getAttribute("adminId");
        admin.setId(adminId);
        
        // 不允许通过此接口修改密码
        admin.setPassword(null);
        
        Admin updatedAdmin = adminService.updateAdmin(admin);
        updatedAdmin.setPassword(null);
        
        return Result.success("更新成功", updatedAdmin);
    }

    /**
     * 登出（客户端清除token即可）
     */
    @PostMapping("/logout")
    public Result<String> logout() {
        return Result.success("登出成功");
    }
}