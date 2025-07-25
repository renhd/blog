package com.example.blog.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.blog.entity.FileEntity;
import com.example.blog.mapper.FileMapper;
import com.example.blog.service.FileStorageService;

@Service
public class FileStorageServiceImpl implements FileStorageService {

	@Value("${file.upload-dir:uploads}")
	private String uploadDir;

	@Value("${file.max-image-size:5242880}") // 5MB
	private long maxImageSize;

	@Value("${file.max-video-size:52428800}") // 50MB
	private long maxVideoSize;

	@Autowired
	private FileMapper fileMapper;

	private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList("image/jpeg", "image/jpg", "image/png",
			"image/gif", "image/webp");

	private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList("video/mp4", "video/webm", "video/quicktime",
			"video/mov");

	@Override
	@Transactional
	public FileEntity storeFile(final MultipartFile file, final Long userId, final String userName) throws IOException {
		if (file.isEmpty()) {
			throw new IllegalArgumentException("文件不能为空");
		}

		final String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
		final String contentType = file.getContentType();
		final long fileSize = file.getSize();

		// 验证文件类型和大小
		if (!isValidFileType(contentType, originalFilename)) {
			throw new IllegalArgumentException("不支持的文件类型");
		}

		final String fileType = getFileType(contentType);
		if (!isValidFileSize(fileSize, fileType)) {
			throw new IllegalArgumentException("文件大小超出限制");
		}

		// 生成文件名和路径
		final String fileExtension = StringUtils.getFilenameExtension(originalFilename);
		final String newFileName = generateFileName(fileExtension);
		final String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
		final String filePath = datePath + "/" + newFileName;

		// 创建目录
		final Path uploadPath = Paths.get(uploadDir, datePath);
		if (!Files.exists(uploadPath)) {
			Files.createDirectories(uploadPath);
		}

		// 保存文件
		final Path targetLocation = uploadPath.resolve(newFileName);
		Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

		// 保存文件信息到数据库
		final FileEntity fileEntity = new FileEntity();
		fileEntity.setOriginalName(originalFilename);
		fileEntity.setFileName(newFileName);
		fileEntity.setFilePath(filePath);
		fileEntity.setFileUrl("/api/files/" + filePath);
		fileEntity.setFileType(fileType);
		fileEntity.setFileSize(fileSize);
		fileEntity.setMimeType(contentType);
		fileEntity.setExtension(fileExtension);
		fileEntity.setUploadUserId(userId);
		fileEntity.setUploadUserName(userName);
		fileEntity.setUploadTime(LocalDateTime.now());
		fileEntity.setUpdateTime(LocalDateTime.now());
		fileEntity.setDownloadCount(0);
		fileEntity.setDeleted(0);

		fileMapper.insert(fileEntity);
		return fileEntity;
	}

	@Override
	@Transactional
	public List<FileEntity> storeFiles(final List<MultipartFile> files, final Long userId, final String userName)
			throws IOException {
		final List<FileEntity> uploadedFiles = new ArrayList<>();
		for (final MultipartFile file : files) {
			uploadedFiles.add(storeFile(file, userId, userName));
		}
		return uploadedFiles;
	}

	@Override
	public FileEntity getFileInfo(final Long fileId) {
		return fileMapper.selectById(fileId);
	}

	@Override
	@Transactional
	public boolean deleteFile(final Long fileId) {
		final FileEntity fileEntity = fileMapper.selectById(fileId);
		if (fileEntity != null) {
			try {
				final Path filePath = Paths.get(uploadDir, fileEntity.getFilePath());
				Files.deleteIfExists(filePath);
				fileMapper.deleteById(fileId);
				return true;
			} catch (final IOException e) {
				throw new RuntimeException("删除文件失败", e);
			}
		}
		return false;
	}

	@Override
	public FileEntity getFileByUrl(final String fileUrl) {
		final String filePath = fileUrl.replace("/api/files/", "");
		return fileMapper.selectOne(new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<FileEntity>()
				.eq("file_path", filePath).eq("deleted", 0));
	}

	@Override
	public String getFileType(final String contentType) {
		if (contentType == null) {
			return "unknown";
		}
		if (contentType.startsWith("image/")) {
			return "image";
		}
		if (contentType.startsWith("video/")) {
			return "video";
		}
		return "other";
	}

	@Override
	public boolean isValidFileType(final String contentType, final String fileName) {
		if (contentType == null || fileName == null) {
			return false;
		}

		String extension = StringUtils.getFilenameExtension(fileName);
		if (extension == null) {
			return false;
		}

		extension = extension.toLowerCase();

		if (ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
			return Arrays.asList("jpg", "jpeg", "png", "gif", "webp").contains(extension);
		}

		if (ALLOWED_VIDEO_TYPES.contains(contentType.toLowerCase())) {
			return Arrays.asList("mp4", "webm", "mov").contains(extension);
		}

		return false;
	}

	@Override
	public boolean isValidFileSize(final long fileSize, final String fileType) {
		switch (fileType) {
		case "image":
			return fileSize <= maxImageSize;
		case "video":
			return fileSize <= maxVideoSize;
		default:
			return false;
		}
	}

	private String generateFileName(final String extension) {
		final String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
		final String uuid = UUID.randomUUID().toString().substring(0, 8);
		return timestamp + "_" + uuid + "." + extension;
	}
}