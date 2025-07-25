# 博客API后端接口说明

## API 基础配置

默认API地址：`http://localhost:3000/api`

你可以在 `api.js` 文件中修改 `baseURL` 来配置你的后端服务地址。

## 所需的API接口

### 1. 获取文章分类
**GET** `/api/categories`

**响应格式:**
```json
[
  {
    "id": 1,
    "name": "JavaScript",
    "slug": "javascript",
    "description": "JavaScript相关文章",
    "post_count": 5
  },
  {
    "id": 2,
    "name": "CSS",
    "slug": "css", 
    "description": "CSS相关文章",
    "post_count": 3
  }
]
```

### 2. 获取文章列表
**GET** `/api/posts`

**查询参数:**
- `page`: 页码 (可选)
- `limit`: 每页数量 (可选)
- `category`: 分类筛选 (可选)

**响应格式:**
```json
[
  {
    "id": 1,
    "title": "JavaScript异步编程详解",
    "slug": "javascript-async-programming", 
    "summary": "深入理解JavaScript中的异步编程模式，包括Promise、async/await等概念。",
    "content": "# JavaScript异步编程详解\n\n## 什么是异步编程？\n...",
    "category": "JavaScript",
    "author": "作者名",
    "date": "2024-01-15",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "featured": true,
    "tags": ["javascript", "async", "promise"]
  }
]
```

### 3. 根据分类获取文章
**GET** `/api/categories/{category}/posts`

**查询参数:**
- `page`: 页码 (可选)
- `limit`: 每页数量 (可选)

**响应格式:** 同获取文章列表

### 4. 获取单篇文章详情
**GET** `/api/posts/{id}`

**响应格式:** 同文章列表中的单个文章对象

### 5. 获取最新文章
**GET** `/api/posts/recent`

**查询参数:**
- `limit`: 返回数量，默认5 (可选)

**响应格式:** 同获取文章列表

### 6. 获取精选文章
**GET** `/api/posts/featured`

**查询参数:**
- `limit`: 返回数量，默认3 (可选)

**响应格式:** 同获取文章列表

### 7. 搜索文章
**GET** `/api/posts/search`

**查询参数:**
- `q`: 搜索关键词 (必需)
- `page`: 页码 (可选)
- `limit`: 每页数量 (可选)

**响应格式:** 同获取文章列表

## 错误处理

所有API接口在出错时应返回以下格式：

```json
{
  "error": true,
  "message": "错误描述",
  "code": "ERROR_CODE"
}
```

常见HTTP状态码：
- 200: 成功
- 400: 请求参数错误
- 404: 资源不存在
- 500: 服务器内部错误

## 使用示例

前端代码会自动调用这些API接口。如果API不可用，系统会显示相应的错误信息，并提供重试选项。

## 开发建议

1. 实现API时请确保返回的数据格式与上述规范一致
2. 建议支持CORS跨域请求
3. 可以考虑添加分页支持以提高性能
4. 建议添加缓存机制提高响应速度