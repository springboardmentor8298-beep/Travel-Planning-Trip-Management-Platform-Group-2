package tripnest_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "itineraries")
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tripName;
    private String day;
    private String plan;

    public Itinerary() {}

    public Itinerary(String tripName, String day, String plan) {
        this.tripName = tripName;
        this.day = day;
        this.plan = plan;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTripName() { return tripName; }
    public void setTripName(String tripName) { this.tripName = tripName; }

    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
}
