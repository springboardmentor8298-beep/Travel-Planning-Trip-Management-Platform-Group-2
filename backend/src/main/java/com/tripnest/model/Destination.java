package com.tripnest.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "destinations", indexes = {
    @Index(name = "idx_dest_country", columnList = "country"),
    @Index(name = "idx_dest_name",    columnList = "name")
})
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(length = 1000)
    private String description;

    @Column(length = 300)
    private String imageUrl;

    /** Starting price per person in INR */
    private BigDecimal startingPrice;

    private Integer durationDays;
    private Integer durationNights;

    /** External booking / travel guide URL */
    @Column(length = 300)
    private String travelGuideUrl;

    /** e.g. Beach, City, Mountain, Heritage */
    @Column(length = 50)
    private String type;

    /** GPS coordinates */
    private Double latitude;
    private Double longitude;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public Destination() {}

    public Long         getId()              { return id; }
    public String       getName()            { return name; }
    public void         setName(String n)    { this.name = n; }
    public String       getCountry()         { return country; }
    public void         setCountry(String c) { this.country = c; }
    public String       getDescription()     { return description; }
    public void         setDescription(String d) { this.description = d; }
    public String       getImageUrl()        { return imageUrl; }
    public void         setImageUrl(String u){ this.imageUrl = u; }
    public BigDecimal   getStartingPrice()   { return startingPrice; }
    public void         setStartingPrice(BigDecimal p) { this.startingPrice = p; }
    public Integer      getDurationDays()    { return durationDays; }
    public void         setDurationDays(Integer d) { this.durationDays = d; }
    public Integer      getDurationNights()  { return durationNights; }
    public void         setDurationNights(Integer n) { this.durationNights = n; }
    public String       getTravelGuideUrl()  { return travelGuideUrl; }
    public void         setTravelGuideUrl(String u) { this.travelGuideUrl = u; }
    public String       getType()            { return type; }
    public void         setType(String t)    { this.type = t; }
    public Double       getLatitude()        { return latitude; }
    public void         setLatitude(Double lat) { this.latitude = lat; }
    public Double       getLongitude()       { return longitude; }
    public void         setLongitude(Double lng) { this.longitude = lng; }
    public LocalDateTime getCreatedAt()      { return createdAt; }
}
