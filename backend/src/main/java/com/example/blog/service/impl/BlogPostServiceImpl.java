package com.example.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.blog.entity.BlogPost;
import com.example.blog.mapper.BlogPostMapper;
import com.example.blog.service.BlogPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BlogPostServiceImpl implements BlogPostService {

    @Autowired
    private BlogPostMapper blogPostMapper;

    @Override
    public Page<BlogPost> getPostsByPage(int pageNum, int pageSize) {
        Page<BlogPost> page = new Page<>(pageNum, pageSize);
        QueryWrapper<BlogPost> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("create_time");
        return blogPostMapper.selectPage(page, queryWrapper);
    }

    @Override
    public Page<BlogPost> getPublishedPostsByPage(int pageNum, int pageSize) {
        Page<BlogPost> page = new Page<>(pageNum, pageSize);
        return blogPostMapper.selectPublishedPosts(page);
    }

    @Override
    public Page<BlogPost> getPostsByCategory(int pageNum, int pageSize, String category) {
        Page<BlogPost> page = new Page<>(pageNum, pageSize);
        return blogPostMapper.selectPostsByCategory(page, category);
    }

    @Override
    public BlogPost getPostById(Long id) {
        return blogPostMapper.selectById(id);
    }

    @Override
    public BlogPost createPost(BlogPost blogPost) {
        blogPost.setViewCount(0);
        blogPost.setStatus(0); // 默认草稿状态
        blogPostMapper.insert(blogPost);
        return blogPost;
    }

    @Override
    public BlogPost updatePost(BlogPost blogPost) {
        blogPostMapper.updateById(blogPost);
        return blogPost;
    }

    @Override
    public boolean deletePost(Long id) {
        return blogPostMapper.deleteById(id) > 0;
    }

    @Override
    public boolean publishPost(Long id) {
        UpdateWrapper<BlogPost> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", id).set("status", 1);
        return blogPostMapper.update(null, updateWrapper) > 0;
    }

    @Override
    public boolean increaseViewCount(Long id) {
        BlogPost post = blogPostMapper.selectById(id);
        if (post != null) {
            post.setViewCount(post.getViewCount() + 1);
            return blogPostMapper.updateById(post) > 0;
        }
        return false;
    }
    
    @Override
    public Page<BlogPost> getAllPostsByCategory(int pageNum, int pageSize, String category) {
        Page<BlogPost> page = new Page<>(pageNum, pageSize);
        QueryWrapper<BlogPost> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("category", category).orderByDesc("create_time");
        return blogPostMapper.selectPage(page, queryWrapper);
    }
    
    @Override
    public Page<BlogPost> getPostsWithFilters(Page<BlogPost> page, Integer status, String category, String title) {
        QueryWrapper<BlogPost> queryWrapper = new QueryWrapper<>();
        
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        
        if (category != null && !category.trim().isEmpty()) {
            queryWrapper.eq("category", category.trim());
        }
        
        if (title != null && !title.trim().isEmpty()) {
            queryWrapper.like("title", title.trim());
        }
        
        queryWrapper.orderByDesc("create_time");
        return blogPostMapper.selectPage(page, queryWrapper);
    }
}