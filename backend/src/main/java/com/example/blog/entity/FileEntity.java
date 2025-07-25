package com.example.blog.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("files")
public class FileEntity {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String originalName;
    
    private String fileName;
    
    private String filePath;
    
    private String fileUrl;
    
    private String fileType;
    
    private Long fileSize;
    
    private String mimeType;
    
    private String extension;
    
    private Long uploadUserId;
    
    private String uploadUserName;
    
    @TableField(fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime uploadTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
    
    private Integer downloadCount;
    
    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;
    
    private String remark;
}