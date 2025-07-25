package com.example.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.blog.entity.BlogPost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BlogPostMapper extends BaseMapper<BlogPost> {
    
    Page<BlogPost> selectPostsByCategory(Page<BlogPost> page, @Param("category") String category);
    
    Page<BlogPost> selectPublishedPosts(Page<BlogPost> page);
}