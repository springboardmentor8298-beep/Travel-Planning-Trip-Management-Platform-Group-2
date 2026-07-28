package com.tripnest.controller;
import com.tripnest.dto.*;
import com.tripnest.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController @RequestMapping("/api/groups")
public class GroupController {
    private final GroupService service; public GroupController(GroupService service){this.service=service;}
    @GetMapping public List<GroupResponse> list(Principal p){return service.list(p.getName());}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public GroupResponse create(Principal p,@Valid @RequestBody GroupRequest r){return service.create(p.getName(),r);}
    @GetMapping("/{groupId}") public GroupResponse get(Principal p,@PathVariable Long groupId){return service.get(p.getName(),groupId);}
    @PostMapping("/{groupId}/members") @ResponseStatus(HttpStatus.CREATED) public GroupMemberResponse invite(Principal p,@PathVariable Long groupId,@Valid @RequestBody GroupMemberRequest r){return service.invite(p.getName(),groupId,r);}
    @PutMapping("/{groupId}/members/{memberId}") public void role(Principal p,@PathVariable Long groupId,@PathVariable Long memberId,@Valid @RequestBody GroupMemberRequest r){service.updateRole(p.getName(),groupId,memberId,r);}
    @DeleteMapping("/{groupId}/members/{memberId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void remove(Principal p,@PathVariable Long groupId,@PathVariable Long memberId){service.removeMember(p.getName(),groupId,memberId);}
    @GetMapping("/{groupId}/messages") public List<GroupMessageResponse> messages(Principal p,@PathVariable Long groupId){return service.messages(p.getName(),groupId);}
    @PostMapping("/{groupId}/messages") @ResponseStatus(HttpStatus.CREATED) public GroupMessageResponse message(Principal p,@PathVariable Long groupId,@Valid @RequestBody GroupMessageRequest r){return service.postMessage(p.getName(),groupId,r);}
}
