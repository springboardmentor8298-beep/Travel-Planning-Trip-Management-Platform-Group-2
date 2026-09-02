package com.tripnest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class DestinationRequest {

    @NotBlank(message = "Destination name is required")
    @Size(max = 150)
    private String name;

    @NotBlank(message = "Country is required")
    @Size(max = 100)
    private String country;

    @Size(max = 1000)
    private String description;

    @Size(max = 300)
    private String imageUrl;

    private BigDecimal startingPrice;
    private Integer durationDays;
    private Integer durationNights;

    @Size(max = 300)
    private String travelGuideUrl;

    @Size(max = 50)
    private String type;

    private Double latitude;
    private Double longitude;

    public String getName()             { return name; }
    public void   setName(String n)     { this.name = n; }
    public String getCountry()          { return country; }
    public void   setCountry(String c)  { this.country = c; }
    public String getDescription()      { return description; }
    public void   setDescription(String d) { this.description = d; }
    public String getImageUrl()         { return imageUrl; }
    public void   setImageUrl(String u) { this.imageUrl = u; }
    public BigDecimal getStartingPrice()           { return startingPrice; }
    public void       setStartingPrice(BigDecimal p){ this.startingPrice = p; }
    public Integer getDurationDays()               { return durationDays; }
    public void    setDurationDays(Integer d)       { this.durationDays = d; }
    public Integer getDurationNights()             { return durationNights; }
    public void    setDurationNights(Integer n)     { this.durationNights = n; }
    public String getTravelGuideUrl()              { return travelGuideUrl; }
    public void   setTravelGuideUrl(String u)      { this.travelGuideUrl = u; }
    public String getType()                        { return type; }
    public void   setType(String t)                { this.type = t; }
    public Double getLatitude()                    { return latitude; }
    public void   setLatitude(Double lat)          { this.latitude = lat; }
    public Double getLongitude()                   { return longitude; }
    public void   setLongitude(Double lng)         { this.longitude = lng; }
}
