package com.example.blog.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.blog.common.Result;
import com.example.blog.entity.BlogPost;
import com.example.blog.service.BlogPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/blog-posts")
@CrossOrigin
public class BlogPostController {

    @Autowired
    private BlogPostService blogPostService;

    @GetMapping
    public Result<Page<BlogPost>> getAllPosts(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String title) {
        
        Page<BlogPost> page = new Page<>(current, size);
        Page<BlogPost> posts = blogPostService.getPostsWithFilters(page, status, category, title);
        return Result.success(posts);
    }

    @GetMapping("/published")
    public Result<Page<BlogPost>> getPublishedPosts(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size) {
        Page<BlogPost> posts = blogPostService.getPublishedPostsByPage(current, size);
        return Result.success(posts);
    }

    @GetMapping("/category/{category}")
    public Result<Page<BlogPost>> getPostsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "published") String status) {
        Page<BlogPost> posts;
        if ("all".equals(status)) {
            posts = blogPostService.getAllPostsByCategory(current, size, category);
        } else {
            posts = blogPostService.getPostsByCategory(current, size, category);
        }
        return Result.success(posts);
    }

    @GetMapping("/{id}")
    public Result<BlogPost> getPostById(@PathVariable Long id) {
        BlogPost post = blogPostService.getPostById(id);
        if (post != null) {
            blogPostService.increaseViewCount(id);
            return Result.success(post);
        }
        return Result.error("文章不存在");
    }

    @PostMapping
    public Result<BlogPost> createPost(@RequestBody BlogPost blogPost) {
        BlogPost createdPost = blogPostService.createPost(blogPost);
        return Result.success("创建成功", createdPost);
    }

    @PutMapping("/{id}")
    public Result<BlogPost> updatePost(@PathVariable Long id, @RequestBody BlogPost blogPost) {
        blogPost.setId(id);
        BlogPost updatedPost = blogPostService.updatePost(blogPost);
        return Result.success("更新成功", updatedPost);
    }

    @DeleteMapping("/{id}")
    public Result<String> deletePost(@PathVariable Long id) {
        boolean deleted = blogPostService.deletePost(id);
        if (deleted) {
            return Result.success("删除成功");
        }
        return Result.error("删除失败");
    }

    @PutMapping("/{id}/publish")
    public Result<String> publishPost(@PathVariable Long id) {
        boolean published = blogPostService.publishPost(id);
        if (published) {
            return Result.success("发布成功");
        }
        return Result.error("发布失败");
    }
}