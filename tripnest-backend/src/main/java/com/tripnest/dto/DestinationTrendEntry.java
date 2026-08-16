package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DestinationTrendEntry {
    private String name;
    private long tripCount;
}
