package com.example.gstapp.security;

import com.example.gstapp.service.UserService;
import com.example.gstapp.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final UserService userService;
    
    @Autowired
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        final String authorizationHeader = request.getHeader("Authorization");
        
        String username = null;
        String jwt = null;
        
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                logger.info("JWT token extracted username: " + username);
                logger.info("JWT token (first 20 chars): " + jwt.substring(0, Math.min(20, jwt.length())) + "...");
            } catch (Exception e) {
                logger.error("JWT token extraction failed", e);
                e.printStackTrace();
            }
        } else {
            logger.warn("No valid authorization header found. Header: " + authorizationHeader);
        }
        
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                logger.info("Attempting to load user details for username: " + username);
                UserDetails userDetails = userService.loadUserByUsername(username);
                logger.info("User details loaded successfully for username: " + username);
                logger.info("User authorities: " + userDetails.getAuthorities());
                
                boolean isValidToken = jwtUtil.validateToken(jwt, userDetails);
                logger.info("JWT token validation result: " + isValidToken);
                
                if (isValidToken) {
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("Authentication set successfully for user: " + username);
                } else {
                    logger.warn("JWT token validation failed for user: " + username);
                }
            } catch (Exception e) {
                logger.error("Error loading user details for username: " + username, e);
                e.printStackTrace();
            }
        } else if (username == null) {
            logger.warn("Username is null, cannot authenticate");
        } else {
            logger.info("User already authenticated: " + username);
        }
        
        filterChain.doFilter(request, response);
    }
}
