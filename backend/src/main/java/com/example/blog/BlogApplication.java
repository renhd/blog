package com.example.blog;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.blog.mapper")
public class BlogApplication {
	public static void main(final String[] args) {
		SpringApplication.run(BlogApplication.class, args);
	}
}