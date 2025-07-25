-- 创建数据库
CREATE DATABASE IF NOT EXISTS blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE blog_db;

-- 博客文章表
CREATE TABLE blog_posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '标题',
    content TEXT COMMENT '内容',
    summary VARCHAR(500) COMMENT '摘要',
    author VARCHAR(100) COMMENT '作者',
    category VARCHAR(100) COMMENT '分类',
    tags VARCHAR(255) COMMENT '标签',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-草稿, 1-已发布',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除: 0-未删除, 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='博客文章表';

-- 分类表
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    description VARCHAR(255) COMMENT '分类描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除: 0-未删除, 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

-- 管理员表
CREATE TABLE admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    email VARCHAR(100) COMMENT '邮箱',
    nickname VARCHAR(100) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    role VARCHAR(20) DEFAULT 'admin' COMMENT '角色: admin-管理员, editor-编辑',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除: 0-未删除, 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 插入示例数据
INSERT INTO categories (name, description) VALUES 
('技术', '技术相关文章'),
('生活', '生活感悟'),
('读书', '读书笔记');

INSERT INTO blog_posts (title, content, summary, author, category, tags, status) VALUES 
('Spring Boot入门教程', 'Spring Boot是一个快速开发框架...', 'Spring Boot基础知识介绍', 'admin', '技术', 'Spring Boot,Java', 1),
('MyBatis Plus使用心得', 'MyBatis Plus是MyBatis的增强工具...', 'MyBatis Plus实践经验分享', 'admin', '技术', 'MyBatis,数据库', 1),
('今日感悟', '今天学习了很多新知识...', '学习心得分享', 'admin', '生活', '感悟,学习', 1);

-- 文件表
CREATE TABLE files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_name VARCHAR(255) NOT NULL COMMENT '存储文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件存储路径',
    file_url VARCHAR(500) NOT NULL COMMENT '文件访问URL',
    file_type VARCHAR(20) NOT NULL COMMENT '文件类型: image-图片, video-视频',
    file_size BIGINT NOT NULL COMMENT '文件大小(字节)',
    mime_type VARCHAR(100) COMMENT 'MIME类型',
    extension VARCHAR(10) COMMENT '文件扩展名',
    upload_user_id BIGINT COMMENT '上传用户ID',
    upload_user_name VARCHAR(100) COMMENT '上传用户名',
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除: 0-未删除, 1-已删除',
    remark VARCHAR(255) COMMENT '备注',
    INDEX idx_upload_user (upload_user_id),
    INDEX idx_upload_time (upload_time),
    INDEX idx_file_type (file_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件上传表';

-- 插入默认管理员账户 (用户名: admin, 密码: admin123)
INSERT INTO admins (username, password, email, nickname, status, role) VALUES 
('admin', '$2a$10$Ha0TjLI.5kMo/ZpGX6mu/.EvEsjRbH8BEa6mhykj4D5PAQFLQ6T7q', 'admin@example.com', '超级管理员', 1, 'admin');