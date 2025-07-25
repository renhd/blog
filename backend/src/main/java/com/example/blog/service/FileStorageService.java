package com.example.blog.service;

import com.example.blog.entity.FileEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FileStorageService {
    
    /**
     * 上传文件
     */
    FileEntity storeFile(MultipartFile file, Long userId, String userName) throws IOException;
    
    /**
     * 批量上传文件
     */
    List<FileEntity> storeFiles(List<MultipartFile> files, Long userId, String userName) throws IOException;
    
    /**
     * 获取文件信息
     */
    FileEntity getFileInfo(Long fileId);
    
    /**
     * 删除文件
     */
    boolean deleteFile(Long fileId);
    
    /**
     * 根据URL获取文件
     */
    FileEntity getFileByUrl(String fileUrl);
    
    /**
     * 获取文件类型
     */
    String getFileType(String contentType);
    
    /**
     * 验证文件类型
     */
    boolean isValidFileType(String contentType, String fileName);
    
    /**
     * 验证文件大小
     */
    boolean isValidFileSize(long fileSize, String fileType);
}