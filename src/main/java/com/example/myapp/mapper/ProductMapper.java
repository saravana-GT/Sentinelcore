package com.example.myapp.mapper;

import com.example.myapp.model.Product;
import java.util.HashMap;
import java.util.Map;

public class ProductMapper {
    public static Map<String, Object> toMap(Product product) {
        if (product == null) {
            return null;
        }
        Map<String, Object> map = new HashMap<>();
        map.put("id", product.getId());
        map.put("name", product.getName());
        map.put("description", product.getDescription());
        map.put("price", product.getPrice());
        return map;
    }
}
