package com.example.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.blog.entity.BlogPost;

public interface BlogPostService {
    
    Page<BlogPost> getPostsByPage(int pageNum, int pageSize);
    
    Page<BlogPost> getPublishedPostsByPage(int pageNum, int pageSize);
    
    Page<BlogPost> getPostsByCategory(int pageNum, int pageSize, String category);
    
    Page<BlogPost> getAllPostsByCategory(int pageNum, int pageSize, String category);
    
    Page<BlogPost> getPostsWithFilters(Page<BlogPost> page, Integer status, String category, String title);
    
    BlogPost getPostById(Long id);
    
    BlogPost createPost(BlogPost blogPost);
    
    BlogPost updatePost(BlogPost blogPost);
    
    boolean deletePost(Long id);
    
    boolean publishPost(Long id);
    
    boolean increaseViewCount(Long id);
}