# 前端项目说明

## 目录结构

```
frontend/
├── admin/                  # 后台管理系统
│   ├── index.html         # 管理后台登录页
│   ├── dashboard.html     # 仪表板
│   ├── articles.html      # 文章管理
│   ├── categories.html    # 分类管理
│   ├── settings.html      # 系统设置
│   ├── css/              # 后台样式文件
│   └── js/               # 后台脚本文件
├── index.html            # 前台首页
├── styles.css            # 前台样式
├── blog.js               # 前台脚本
├── api.js                # API 接口封装
├── test.html             # 测试页面
└── README.md             # 说明文档
```

## 访问方式

### 前台
- 首页: `frontend/index.html`
- 文章详情: `frontend/article.html?id={文章ID}` (待实现)

### 后台管理
- 登录页: `frontend/admin/index.html`
- 仪表板: `frontend/admin/dashboard.html`
- 文章管理: `frontend/admin/articles.html`
- 分类管理: `frontend/admin/categories.html`
- 系统设置: `frontend/admin/settings.html`

## 开发说明

1. 所有前端文件现在统一在 `frontend` 目录下
2. 后台管理系统在 `admin` 子目录中
3. API 地址配置在 `api.js` 中，默认指向 `http://localhost:8080/api`
4. 前台和后台共享同一套 API 接口

## 部署说明

将整个 `frontend` 目录部署到 Web 服务器即可，确保：
1. 后端 API 服务正常运行
2. CORS 配置允许前端域名访问
3. 静态文件服务器支持 HTML5 History API（如需路由功能）