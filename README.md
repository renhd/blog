# 博客管理系统

一个基于 Spring Boot + MyBatis Plus + MySQL 的完整博客管理系统，包含前台展示和后台管理功能。

成品展示： [博客](https://www.xgourd.cn)

## 技术栈

### 后端
- Spring Boot 2.7.18 (兼容 Java 8)
- MySQL 8.0
- MyBatis Plus 3.5.3
- JWT 认证 (HMAC-SHA256)
- BCrypt 密码加密

### 前端
- HTML5 + CSS3 + JavaScript
- Markdown 编辑器支持
- 响应式设计
- 深色/浅色主题切换

## 快速开始

### 环境要求
- Java 8+
- MySQL 8.0+
- Maven 3.6+

### 安装部署

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd blog
   ```

2. **数据库配置**
   - 创建数据库：`CREATE DATABASE blog_db`
   - 执行初始化脚本：`backend/src/main/resources/sql/init.sql`

3. **后端配置**
   ```bash
   cd backend
   # 修改 application.yml 中的数据库配置
   mvn clean install
   mvn spring-boot:run
   ```

4. **前端部署**
   - 将 `frontend` 目录部署到 Web 服务器
   - 或直接在浏览器中打开 `frontend/index.html`

## 功能特性

### 前台功能
- 📖 文章列表展示和分页
- 🏷️ 分类筛选
- 📝 Markdown 文章渲染
- 🎨 代码语法高亮
- 🌓 深色/浅色主题
- 📱 响应式设计
- 🔍 文章搜索

### 后台管理
- 🔐 JWT 用户认证
- 📊 数据统计仪表板
- ✍️ 文章 CRUD 管理
- 📂 分类管理
- 📁 文件上传
- ⚙️ 系统设置

## API 文档

详细的 API 接口文档请参考 [API_README.md](API_README.md)

### 主要接口
- `GET /blog-posts` - 获取文章列表
- `POST /admin/login` - 管理员登录
- `POST /files/upload` - 文件上传

## 项目结构

```
├── backend/          # Spring Boot 后端
├── frontend/         # 前端项目
│   ├── admin/        # 后台管理
│   └── css/js/       # 前台资源
├── test_api.sh       # API 测试脚本
└── README.md         # 项目说明
```

## 测试

### 默认管理员账户
- 用户名：`admin`
- 密码：`admin123`

### API 测试
```bash
chmod +x test_api.sh
./test_api.sh
```

## 开发

### 常用命令
```bash
# 后端开发
cd backend
mvn clean install      # 编译项目
mvn spring-boot:run    # 启动开发服务器
mvn test              # 运行测试

# 数据库备份/恢复
mysqldump -u用户名 -p blog_db > backup.sql
mysql -u用户名 -p blog_db < backup.sql
```

### 配置说明

修改 `backend/src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/blog_db
    username: your_username
    password: your_password

jwt:
  secret: your_jwt_secret
  expiration: 86400000  # 24小时
```

## 部署建议

### 生产环境
1. 配置反向代理 (Nginx)
2. 使用 HTTPS
3. 配置文件权限
4. 定期数据备份
5. 监控日志和性能

## 许可证

MIT License

## 更新日志

- **v1.1.0** - 添加文件上传、代码高亮、Mermaid 图表支持
- **v1.0.0** - 基础功能完成，包含前后台完整功能

---

如有问题，请查看 [CLAUDE.md](CLAUDE.md) 获取详细的项目文档。