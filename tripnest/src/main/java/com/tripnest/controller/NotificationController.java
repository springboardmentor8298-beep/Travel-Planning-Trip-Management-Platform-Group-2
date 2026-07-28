package com.tripnest.controller;
import com.tripnest.dto.NotificationResponse;
import com.tripnest.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController @RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service; public NotificationController(NotificationService service){this.service=service;}
    @GetMapping public List<NotificationResponse> list(Principal p){return service.list(p.getName()).stream().map(n->new NotificationResponse(n.getId(),n.getTitle(),n.getMessage(),Boolean.TRUE.equals(n.getIsRead()),n.getCreatedAt())).toList();}
    @PatchMapping("/{id}/read") @ResponseStatus(HttpStatus.NO_CONTENT) public void read(Principal p,@PathVariable Long id){service.markRead(p.getName(),id);}
    @PatchMapping("/read-all") @ResponseStatus(HttpStatus.NO_CONTENT) public void readAll(Principal p){service.markAllRead(p.getName());}
}
