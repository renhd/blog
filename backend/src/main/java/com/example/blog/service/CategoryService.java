package com.example.blog.service;

import java.util.List;

import com.example.blog.entity.Category;

public interface CategoryService {

	List<Category> getAllCategories();

	Category getCategoryById(Long id);

	Category createCategory(Category category);

	Category updateCategory(Category category);

	boolean deleteCategory(Long id);
}