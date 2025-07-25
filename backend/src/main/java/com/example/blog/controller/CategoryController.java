package com.example.blog.controller;

import com.example.blog.common.Result;
import com.example.blog.entity.Category;
import com.example.blog.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@CrossOrigin
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public Result<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return Result.success(categories);
    }

    @GetMapping("/{id}")
    public Result<Category> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id);
        if (category != null) {
            return Result.success(category);
        }
        return Result.error("分类不存在");
    }

    @PostMapping
    public Result<Category> createCategory(@RequestBody Category category) {
        Category createdCategory = categoryService.createCategory(category);
        return Result.success("创建成功", createdCategory);
    }

    @PutMapping("/{id}")
    public Result<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        category.setId(id);
        Category updatedCategory = categoryService.updateCategory(category);
        return Result.success("更新成功", updatedCategory);
    }

    @DeleteMapping("/{id}")
    public Result<String> deleteCategory(@PathVariable Long id) {
        boolean deleted = categoryService.deleteCategory(id);
        if (deleted) {
            return Result.success("删除成功");
        }
        return Result.error("删除失败");
    }
}