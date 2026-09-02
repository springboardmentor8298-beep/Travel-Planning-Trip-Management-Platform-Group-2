package com.tripnest.dto;

import com.tripnest.model.Destination;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DestinationResponse {

    private Long        id;
    private String      name;
    private String      country;
    private String      description;
    private String      imageUrl;
    private BigDecimal  startingPrice;
    private Integer     durationDays;
    private Integer     durationNights;
    private String      travelGuideUrl;
    private String      type;
    private Double      latitude;
    private Double      longitude;
    private LocalDateTime createdAt;

    public static DestinationResponse fromEntity(Destination d) {
        DestinationResponse r = new DestinationResponse();
        r.id             = d.getId();
        r.name           = d.getName();
        r.country        = d.getCountry();
        r.description    = d.getDescription();
        r.imageUrl       = d.getImageUrl();
        r.startingPrice  = d.getStartingPrice();
        r.durationDays   = d.getDurationDays();
        r.durationNights = d.getDurationNights();
        r.travelGuideUrl = d.getTravelGuideUrl();
        r.type           = d.getType();
        r.latitude       = d.getLatitude();
        r.longitude      = d.getLongitude();
        r.createdAt      = d.getCreatedAt();
        return r;
    }

    public Long        getId()              { return id; }
    public String      getName()            { return name; }
    public String      getCountry()         { return country; }
    public String      getDescription()     { return description; }
    public String      getImageUrl()        { return imageUrl; }
    public BigDecimal  getStartingPrice()   { return startingPrice; }
    public Integer     getDurationDays()    { return durationDays; }
    public Integer     getDurationNights()  { return durationNights; }
    public String      getTravelGuideUrl()  { return travelGuideUrl; }
    public String      getType()            { return type; }
    public Double      getLatitude()        { return latitude; }
    public Double      getLongitude()       { return longitude; }
    public LocalDateTime getCreatedAt()     { return createdAt; }
}
