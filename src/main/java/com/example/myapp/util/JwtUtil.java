package com.example.myapp.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static Key SIGNING_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static long EXPIRATION_TIME = 86400000;

    @Value("${jwt.secret:}")
    public void setSecret(String secret) {
        if (secret != null && !secret.isBlank() && secret.length() >= 32) {
            byte[] keyBytes = new byte[32];
            byte[] inputBytes = secret.getBytes();
            System.arraycopy(inputBytes, 0, keyBytes, 0, Math.min(inputBytes.length, 32));
            SIGNING_KEY = Keys.hmacShaKeyFor(keyBytes);
        }
    }

    @Value("${jwt.expiration:86400000}")
    public void setExpiration(long expiration) {
        EXPIRATION_TIME = expiration;
    }

    public static String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SIGNING_KEY)
                .compact();
    }

    public static Claims validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(SIGNING_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null;
        }
    }
}
