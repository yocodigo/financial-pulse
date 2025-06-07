package com.financialdashboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public abstract class BaseController<T, ID> {
    
    protected ResponseEntity<T> ok(T body) {
        return ResponseEntity.ok(body);
    }
    
    protected ResponseEntity<List<T>> ok(List<T> body) {
        return ResponseEntity.ok(body);
    }
    
    protected ResponseEntity<Void> noContent() {
        return ResponseEntity.noContent().build();
    }
    
    protected ResponseEntity<T> created(T body) {
        return ResponseEntity.status(201).body(body);
    }
    
    protected ResponseEntity<Void> notFound() {
        return ResponseEntity.notFound().build();
    }
    
    protected ResponseEntity<T> badRequest(T body) {
        return ResponseEntity.badRequest().body(body);
    }
} 