package com.example.blog.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.blog.common.Result;
import com.example.blog.entity.BlogPost;
import com.example.blog.entity.Category;
import com.example.blog.service.BlogPostService;
import com.example.blog.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminDashboardController {

    @Autowired
    private BlogPostService blogPostService;

    @Autowired
    private CategoryService categoryService;

    /**
     * 获取仪表板统计数据
     */
    @GetMapping("/dashboard/stats")
    public Result<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 获取文章统计
        Page<BlogPost> postPage = blogPostService.getPostsByPage(1, Integer.MAX_VALUE);
        List<BlogPost> postList = postPage.getRecords();
        
        // 文章总数
        stats.put("totalPosts", postList.size());
        
        // 已发布文章数
        long publishedPosts = postList.stream().filter(post -> post.getStatus() == 1).count();
        stats.put("publishedPosts", publishedPosts);
        
        // 草稿数
        long draftPosts = postList.stream().filter(post -> post.getStatus() == 0).count();
        stats.put("draftPosts", draftPosts);
        
        // 总浏览量
        int totalViews = postList.stream().mapToInt(post -> post.getViewCount() != null ? post.getViewCount() : 0).sum();
        stats.put("totalViews", totalViews);
        
        // 今日浏览量（模拟数据，实际应从访问日志计算）
        stats.put("todayViews", Math.max(1, totalViews / 10));
        
        // 分类统计
        List<Category> categories = categoryService.getAllCategories();
        stats.put("totalCategories", categories.size());
        
        // 分类文章数统计
        Map<String, Integer> categoryStats = new HashMap<>();
        for (Category category : categories) {
            long count = postList.stream().filter(post -> category.getName().equals(post.getCategory())).count();
            categoryStats.put(category.getName(), (int) count);
        }
        stats.put("categoryStats", categoryStats);
        
        return Result.success(stats);
    }

    /**
     * 获取最近文章
     */
    @GetMapping("/dashboard/recent-posts")
    public Result<List<BlogPost>> getRecentPosts(@RequestParam(defaultValue = "5") int limit) {
        Page<BlogPost> page = blogPostService.getPostsByPage(1, limit);
        return Result.success(page.getRecords());
    }

    /**
     * 获取系统信息
     */
    @GetMapping("/dashboard/system-info")
    public Result<Map<String, Object>> getSystemInfo() {
        Map<String, Object> info = new HashMap<>();
        
        // 系统版本
        info.put("version", "Blog System v1.0");
        
        // 数据库类型
        info.put("database", "MySQL 8.0");
        
        // Java版本
        info.put("javaVersion", System.getProperty("java.version"));
        
        // 运行时间（模拟）
        long uptime = System.currentTimeMillis() / 1000 / 60 / 60 / 24; // 天数
        info.put("uptime", uptime + " 天");
        
        // 内存使用情况
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        
        Map<String, String> memoryInfo = new HashMap<>();
        memoryInfo.put("total", totalMemory / 1024 / 1024 + " MB");
        memoryInfo.put("used", usedMemory / 1024 / 1024 + " MB");
        memoryInfo.put("free", freeMemory / 1024 / 1024 + " MB");
        info.put("memory", memoryInfo);
        
        return Result.success(info);
    }
}