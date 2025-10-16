package com.example.gstapp.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/public/images")
@CrossOrigin(origins = "*")
public class PublicImageController {

    private static final String UPLOAD_DIR = "uploads/company/";

    /**
     * Serve uploaded images directly (public endpoint)
     */
    @GetMapping("/{type}/{filename}")
    public ResponseEntity<Resource> serveImage(@PathVariable String type, @PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + type + "s/" + filename);
            Resource resource = new FileSystemResource(filePath);
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
