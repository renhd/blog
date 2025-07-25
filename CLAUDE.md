# 博客管理系统 - 项目文档

## 项目概述

这是一个基于 Spring Boot + MyBatis Plus + MySQL 的完整博客管理系统，包含前台展示和后台管理功能。

## 技术栈

### 后端
- **框架**: Spring Boot 2.7.18 (兼容 Java 8)
- **数据库**: MySQL 8.0
- **ORM**: MyBatis Plus 3.5.3
- **认证**: JWT (HMAC-SHA256)
- **密码加密**: BCrypt
- **构建工具**: Maven

### 前端
- **原生技术**: HTML5 + CSS3 + JavaScript
- **UI组件**: Font Awesome 图标
- **编辑器**: Markdown 编辑器
- **设计**: 响应式设计，支持深色/浅色主题

## 项目结构

```
/Users/renhd/work/gitcode/blog/
├── backend/                     # 后端 Spring Boot 项目
│   ├── src/main/java/com/example/blog/
│   │   ├── controller/          # 控制器层
│   │   ├── service/             # 服务层
│   │   ├── entity/              # 实体类
│   │   ├── mapper/              # 数据访问层
│   │   ├── config/              # 配置类
│   │   ├── util/                # 工具类
│   │   └── interceptor/         # 拦截器
│   ├── src/main/resources/
│   │   ├── application.yml      # 应用配置
│   │   ├── mapper/              # MyBatis XML 映射
│   │   └── sql/init.sql         # 数据库初始化脚本
│   └── pom.xml                  # Maven 配置
├── frontend/                    # 前端项目
│   ├── admin/                   # 后台管理前端
│   │   ├── index.html           # 登录页面
│   │   ├── dashboard.html       # 仪表板
│   │   ├── articles.html        # 文章管理
│   │   ├── categories.html      # 分类管理
│   │   ├── settings.html        # 系统设置
│   │   ├── css/                 # 管理后台样式文件
│   │   │   ├── login.css        # 登录页样式
│   │   │   ├── dashboard.css    # 仪表板样式
│   │   │   ├── articles.css     # 文章管理样式
│   │   │   ├── categories.css   # 分类管理样式
│   │   │   └── settings.css     # 设置页样式
│   │   └── js/                  # 管理后台脚本文件
│   │       ├── auth.js          # 认证管理
│   │       ├── login.js         # 登录逻辑
│   │       ├── dashboard.js     # 仪表板逻辑
│   │       ├── articles.js      # 文章管理逻辑
│   │       ├── categories.js    # 分类管理逻辑
│   │       └── settings.js      # 设置页逻辑
│   ├── index.html               # 前台首页
│   ├── styles.css               # 前台样式
│   ├── blog.js                  # 前台逻辑
│   ├── api.js                   # API 接口封装
│   └── test.html                # 测试页面
├── test_api.sh                  # API 测试脚本
├── API_README.md                # API 文档
└── CLAUDE.md                    # 项目文档
```

## 核心功能

### 前台功能
1. **文章展示**: 分页显示已发布文章
2. **分类浏览**: 按分类筛选文章
3. **文章详情**: 支持 Markdown 渲染
4. **响应式设计**: 适配各种设备屏幕
5. **主题切换**: 深色/浅色主题
6. **回到顶部**: 智能显示滚动按钮

### 后台管理功能
1. **用户认证**: JWT 登录验证
2. **仪表板**: 数据统计和图表展示
3. **文章管理**: CRUD 操作，Markdown 编辑器
4. **分类管理**: 分类的增删改查
5. **系统设置**: 个人信息、安全设置、系统维护

## API 接口

### 文章接口 (`/blog-posts`)
- `GET /blog-posts` - 获取文章列表（支持筛选）
- `GET /blog-posts/published` - 获取已发布文章
- `GET /blog-posts/category/{category}` - 按分类获取文章
- `GET /blog-posts/{id}` - 获取文章详情
- `POST /blog-posts` - 创建文章
- `PUT /blog-posts/{id}` - 更新文章
- `DELETE /blog-posts/{id}` - 删除文章
- `PUT /blog-posts/{id}/publish` - 发布文章

### 分类接口 (`/categories`)
- `GET /categories` - 获取所有分类
- `POST /categories` - 创建分类
- `PUT /categories/{id}` - 更新分类
- `DELETE /categories/{id}` - 删除分类

### 管理员接口 (`/admin`)
- `POST /admin/login` - 管理员登录
- `GET /admin/profile` - 获取当前用户信息
- `PUT /admin/profile` - 更新个人信息
- `POST /admin/change-password` - 修改密码

### 仪表板接口 (`/admin/dashboard`)
- `GET /admin/dashboard/stats` - 获取统计数据
- `GET /admin/dashboard/recent-posts` - 获取最近文章
- `GET /admin/dashboard/system-info` - 获取系统信息

## 数据库设计

### 主要数据表

1. **blog_posts** - 文章表
   - id (主键)
   - title (标题)
   - content (内容)
   - summary (摘要)
   - category (分类)
   - status (状态: 0-草稿, 1-已发布)
   - view_count (阅读量)
   - create_time (创建时间)
   - update_time (更新时间)
   - is_deleted (逻辑删除)

2. **categories** - 分类表
   - id (主键)
   - name (分类名称)
   - description (描述)
   - create_time (创建时间)
   - update_time (更新时间)
   - is_deleted (逻辑删除)

3. **admin** - 管理员表
   - id (主键)
   - username (用户名)
   - password (加密密码)
   - email (邮箱)
   - nickname (昵称)
   - role (角色)
   - avatar (头像)
   - last_login_time (最后登录时间)
   - create_time (创建时间)
   - update_time (更新时间)

## 安全配置

### 认证机制
- JWT Token 认证，过期时间 24 小时
- BCrypt 密码哈希，强度等级 10
- 密码要求：至少8位，包含大小写字母、数字和特殊字符

### 权限控制
- AuthInterceptor 拦截器验证管理员权限
- CORS 跨域配置支持前后端分离

## 开发环境配置

### 数据库配置 (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/blog_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### JWT 配置
```yaml
jwt:
  secret: your_jwt_secret_key_here
  expiration: 86400000  # 24小时
```

## 部署说明

### 后端部署
1. 确保 Java 8 环境
2. 配置 MySQL 数据库
3. 执行 `sql/init.sql` 初始化数据
4. 修改 `application.yml` 数据库配置
5. 运行 `mvn clean package` 打包
6. 启动 `java -jar target/blog-0.0.1-SNAPSHOT.jar`

### 前端部署
1. 将 `frontend` 目录部署到 Web 服务器
2. 将 `frontend/admin` 目录部署到管理后台路径
3. 确保 API 地址配置正确

## 测试信息

### 默认管理员账户
- 用户名: admin
- 密码: admin123

### API 测试
可使用 `test_api.sh` 脚本测试 API 接口功能。

## 常见问题

### 编译错误
如遇到 "无效的标记: --release" 错误，确保：
- 使用 Java 8
- Spring Boot 版本为 2.7.18
- Maven 配置正确的 Java 版本

### API 404 错误
确保前端 API 调用路径与后端控制器路径一致：
- 文章接口使用 `/blog-posts`
- 管理接口使用 `/admin`

## 维护命令

### 常用操作
- `mvn clean install` - 编译安装项目
- `mvn spring-boot:run` - 启动开发服务器
- `mvn test` - 运行测试用例

### 数据库操作
- 备份: `mysqldump -u用户名 -p密码 blog_db > backup.sql`
- 恢复: `mysql -u用户名 -p密码 blog_db < backup.sql`

## 更新日志

### v1.0.0 (2024-12-15)
- ✅ 完成后端 API 开发
- ✅ 实现前台展示功能
- ✅ 开发后台管理系统
- ✅ 集成 JWT 认证
- ✅ 添加系统设置功能
- ✅ 实现响应式设计
- ✅ 支持 Markdown 编辑

## 开发团队

本项目由 Claude Code 协助开发完成。

## 许可证

MIT License