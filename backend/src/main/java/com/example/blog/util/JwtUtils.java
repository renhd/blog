package com.example.blog.util;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {

	private static final String SECRET_KEY = "mySecretKeyForBlogSystemThatIsLongEnoughForHS256Algorithm";
	private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000L; // 24小时

	private final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

	/**
	 * 生成JWT token
	 */
	public String generateToken(final String username, final Long adminId) {
		final Date now = new Date();
		final Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

		return Jwts.builder().setSubject(username).claim("adminId", adminId).setIssuedAt(now).setExpiration(expiryDate)
				.signWith(key, SignatureAlgorithm.HS256).compact();
	}

	/**
	 * 从token中获取用户名
	 */
	public String getUsernameFromToken(final String token) {
		final Claims claims = getClaimsFromToken(token);
		return claims.getSubject();
	}

	/**
	 * 从token中获取管理员ID
	 */
	public Long getAdminIdFromToken(final String token) {
		final Claims claims = getClaimsFromToken(token);
		return claims.get("adminId", Long.class);
	}

	/**
	 * 验证token是否有效
	 */
	public boolean validateToken(final String token) {
		try {
			Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
			return true;
		} catch (JwtException | IllegalArgumentException e) {
			return false;
		}
	}

	/**
	 * 检查token是否过期
	 */
	public boolean isTokenExpired(final String token) {
		try {
			final Claims claims = getClaimsFromToken(token);
			return claims.getExpiration().before(new Date());
		} catch (final Exception e) {
			return true;
		}
	}

	private Claims getClaimsFromToken(final String token) {
		return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
	}
}