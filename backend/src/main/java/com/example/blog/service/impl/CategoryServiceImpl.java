package com.example.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.blog.entity.Category;
import com.example.blog.mapper.CategoryMapper;
import com.example.blog.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    @Override
    public List<Category> getAllCategories() {
        QueryWrapper<Category> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByAsc("create_time");
        return categoryMapper.selectList(queryWrapper);
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryMapper.selectById(id);
    }

    @Override
    public Category createCategory(Category category) {
        categoryMapper.insert(category);
        return category;
    }

    @Override
    public Category updateCategory(Category category) {
        categoryMapper.updateById(category);
        return category;
    }

    @Override
    public boolean deleteCategory(Long id) {
        return categoryMapper.deleteById(id) > 0;
    }
}