package com.example.blog.interceptor;

import com.example.blog.service.AdminService;
import com.example.blog.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AdminService adminService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 处理OPTIONS预检请求
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String token = getTokenFromRequest(request);
        
        // 检查token是否存在
        if (token == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"message\":\"未提供认证token\"}");
            return false;
        }

        // 验证token
        if (!jwtUtils.validateToken(token) || jwtUtils.isTokenExpired(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"message\":\"token无效或已过期\"}");
            return false;
        }

        // 将管理员信息存储到request中
        Long adminId = jwtUtils.getAdminIdFromToken(token);
        request.setAttribute("adminId", adminId);
        request.setAttribute("username", jwtUtils.getUsernameFromToken(token));

        return true;
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}