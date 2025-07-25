package com.example.blog.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.blog.common.Result;
import com.example.blog.entity.FileEntity;
import com.example.blog.service.FileStorageService;
import com.example.blog.util.JwtUtils;

@RestController
@RequestMapping("/files")
@CrossOrigin
public class FileUploadController {

	@Autowired
	private FileStorageService fileStorageService;

	@Autowired
	private JwtUtils jwtUtils;

	@Value("${file.upload-dir:uploads}")
	private String uploadDir;

	@PostMapping("/upload")
	public Result uploadFile(@RequestParam("file") final MultipartFile file,
			@RequestHeader(value = "Authorization", required = false) final String authHeader) {
		try {
			Long userId = 1L; // 默认用户ID
			String userName = "admin"; // 默认用户名

			// 从JWT获取用户信息
			if (authHeader != null && authHeader.startsWith("Bearer ")) {
				final String token = authHeader.substring(7);
				userId = jwtUtils.getAdminIdFromToken(token);
				userName = jwtUtils.getUsernameFromToken(token);
			}

			final FileEntity fileEntity = fileStorageService.storeFile(file, userId, userName);
			return Result.success("文件上传成功", fileEntity);
		} catch (final IllegalArgumentException e) {
			return Result.error(e.getMessage());
		} catch (final IOException e) {
			return Result.error("文件上传失败: " + e.getMessage());
		}
	}

	@PostMapping("/upload/batch")
	public Result uploadMultipleFiles(@RequestParam("files") final List<MultipartFile> files,
			@RequestHeader(value = "Authorization", required = false) final String authHeader) {
		try {
			Long userId = 1L;
			String userName = "admin";

			if (authHeader != null && authHeader.startsWith("Bearer ")) {
				final String token = authHeader.substring(7);
				userId = jwtUtils.getAdminIdFromToken(token);
				userName = jwtUtils.getUsernameFromToken(token);
			}

			final List<FileEntity> uploadedFiles = fileStorageService.storeFiles(files, userId, userName);
			return Result.success("文件批量上传成功", uploadedFiles);
		} catch (final IllegalArgumentException e) {
			return Result.error(e.getMessage());
		} catch (final IOException e) {
			return Result.error("文件上传失败: " + e.getMessage());
		}
	}

	@GetMapping("/**")
	public ResponseEntity<Resource> downloadFile(final HttpServletRequest request) {
		final String requestURI = request.getRequestURI();
		final String filePath = requestURI.substring(requestURI.indexOf("/api/files/") + "/api/files/".length());

		try {
			final Path fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
			final Path file = fileStorageLocation.resolve(filePath).normalize();

			// 安全检查：确保文件在指定目录内
			if (!file.startsWith(fileStorageLocation)) {
				return ResponseEntity.badRequest().build();
			}

			if (!Files.exists(file)) {
				System.out.println("File not found: " + file.toString());
				return ResponseEntity.notFound().build();
			}

			final Resource resource = new UrlResource(file.toUri());

			if (resource.exists()) {
				String contentType = null;
				try {
					contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
				} catch (final IOException ex) {
					contentType = "application/octet-stream";
				}

				if (contentType == null) {
					contentType = "application/octet-stream";
				}

				return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
//						.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
						.body(resource);
			} else {
				return ResponseEntity.notFound().build();
			}
		} catch (final Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().build();
		}
	}

	@GetMapping("/info/{fileId}")
	public Result getFileInfo(@PathVariable final Long fileId) {
		try {
			final FileEntity fileEntity = fileStorageService.getFileInfo(fileId);
			if (fileEntity != null) {
				return Result.success(fileEntity);
			} else {
				return Result.error("文件不存在");
			}
		} catch (final Exception e) {
			return Result.error("获取文件信息失败");
		}
	}

	@DeleteMapping("/{fileId}")
	public Result deleteFile(@PathVariable final Long fileId) {
		try {
			final boolean deleted = fileStorageService.deleteFile(fileId);
			if (deleted) {
				return Result.success("文件删除成功");
			} else {
				return Result.error("文件不存在");
			}
		} catch (final Exception e) {
			return Result.error("文件删除失败");
		}
	}
}