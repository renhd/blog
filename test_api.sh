#!/bin/bash

echo "测试博客后端API接口..."
echo "=============================="

# 基础URL
BASE_URL="http://localhost:8080/api"

echo "1. 测试获取所有分类"
curl -s "$BASE_URL/categories" | python -m json.tool || echo "分类接口测试失败"

echo -e "\n2. 测试获取已发布文章"
curl -s "$BASE_URL/posts/published" | python -m json.tool || echo "文章接口测试失败"

echo -e "\n3. 测试创建新分类"
curl -s -X POST "$BASE_URL/categories" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试分类","description":"这是一个测试分类"}' | python -m json.tool || echo "创建分类失败"

echo -e "\n4. 测试创建新文章"
curl -s -X POST "$BASE_URL/posts" \
  -H "Content-Type: application/json" \
  -d '{"title":"测试文章","content":"这是文章内容","summary":"文章摘要","author":"测试作者","category":"技术","tags":"测试,API"}' | python -m json.tool || echo "创建文章失败"

echo -e "\n=============================="
echo "API测试完成"