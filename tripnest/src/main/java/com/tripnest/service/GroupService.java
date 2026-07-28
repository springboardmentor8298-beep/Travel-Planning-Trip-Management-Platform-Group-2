package com.tripnest.service;

import com.tripnest.dto.*;
import com.tripnest.entity.*;
import com.tripnest.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @Transactional
public class GroupService {
    private final TravelGroupRepository groups; private final GroupMemberRepository members; private final GroupDiscussionRepository discussions;
    private final UserRepository users; private final TripRepository trips; private final TripMemberRepository tripMembers; private final NotificationService notifications;
    public GroupService(TravelGroupRepository groups, GroupMemberRepository members, GroupDiscussionRepository discussions, UserRepository users, TripRepository trips, TripMemberRepository tripMembers, NotificationService notifications) { this.groups=groups; this.members=members; this.discussions=discussions; this.users=users; this.trips=trips; this.tripMembers=tripMembers; this.notifications=notifications; }
    public List<GroupResponse> list(String email) { return groups.findByOwnerEmailOrMembersUserEmailOrderByCreatedAtDesc(email,email).stream().distinct().map(this::response).toList(); }
    public GroupResponse create(String email, GroupRequest request) { User owner=user(email); TravelGroup group=new TravelGroup(); group.setName(request.name().trim()); group.setDescription(request.description()); group.setOwner(owner); group.setCreatedAt(LocalDateTime.now()); if(request.tripId()!=null) group.setTrip(accessibleTrip(email,request.tripId())); TravelGroup saved=groups.save(group); members.save(new GroupMember(null,saved,owner,"OWNER")); return response(saved); }
    public GroupResponse get(String email, Long groupId) { return response(member(email,groupId).getGroup()); }
    public GroupMemberResponse invite(String email, Long groupId, GroupMemberRequest request) { TravelGroup group=admin(email,groupId); User invitee=user(request.email()); if(members.findByGroupIdAndUserEmail(groupId,invitee.getEmail()).isPresent()) throw new RuntimeException("User is already in this group"); GroupMember saved=members.save(new GroupMember(null,group,invitee,request.memberRole()==null||request.memberRole().isBlank()?"MEMBER":request.memberRole().trim().toUpperCase())); notifications.dispatch(invitee,"Travel group invitation","You were added to " + group.getName() + "."); return memberResponse(saved); }
    public void updateRole(String email,Long groupId,Long memberId,GroupMemberRequest request){admin(email,groupId);GroupMember groupMember=members.findById(memberId).filter(m->m.getGroup().getId().equals(groupId)).orElseThrow(()->new RuntimeException("Group member not found"));if("OWNER".equals(groupMember.getMemberRole()))throw new RuntimeException("The group owner role cannot be changed");groupMember.setMemberRole(request.memberRole()==null||request.memberRole().isBlank()?"MEMBER":request.memberRole().trim().toUpperCase());}
    public void removeMember(String email, Long groupId, Long memberId) { admin(email,groupId); GroupMember groupMember=members.findById(memberId).filter(m->m.getGroup().getId().equals(groupId)).orElseThrow(()->new RuntimeException("Group member not found")); if("OWNER".equals(groupMember.getMemberRole())) throw new RuntimeException("The group owner cannot be removed"); members.delete(groupMember); }
    public List<GroupMessageResponse> messages(String email, Long groupId) { member(email,groupId); return discussions.findByGroupIdOrderByCreatedAtAsc(groupId).stream().map(this::messageResponse).toList(); }
    public GroupMessageResponse postMessage(String email, Long groupId, GroupMessageRequest request) { TravelGroup group=member(email,groupId).getGroup(); GroupDiscussion message=new GroupDiscussion(); message.setGroup(group); message.setAuthor(user(email)); message.setMessage(request.message().trim()); message.setCreatedAt(LocalDateTime.now()); GroupDiscussion saved=discussions.save(message); members.findByGroupId(groupId).stream().filter(m->!m.getUser().getEmail().equals(email)).forEach(m->notifications.dispatch(m.getUser(),"Group update",user(email).getFullName()+" posted in "+group.getName()+".")); return messageResponse(saved); }
    private TravelGroup admin(String email,Long groupId){GroupMember groupMember=member(email,groupId);if(!List.of("OWNER","ADMIN").contains(groupMember.getMemberRole()))throw new RuntimeException("Group admin access required");return groupMember.getGroup();}
    private GroupMember member(String email,Long groupId){return members.findByGroupIdAndUserEmail(groupId,email).orElseThrow(()->new RuntimeException("Travel group not found"));}
    private Trip accessibleTrip(String email,Long tripId){return trips.findById(tripId).filter(t->t.getUser().getEmail().equals(email)||tripMembers.findByTripIdAndUserEmail(tripId,email).isPresent()).orElseThrow(()->new RuntimeException("Trip not found"));}
    private User user(String email){return users.findByEmail(email).orElseThrow(()->new RuntimeException("User not found"));}
    private GroupResponse response(TravelGroup group){return new GroupResponse(group.getId(),group.getName(),group.getDescription(),group.getTrip()==null?null:group.getTrip().getId(),group.getTrip()==null?null:group.getTrip().getTripName(),group.getOwner().getFullName(),group.getCreatedAt(),members.findByGroupId(group.getId()).stream().map(this::memberResponse).toList());}
    private GroupMemberResponse memberResponse(GroupMember groupMember){return new GroupMemberResponse(groupMember.getId(),groupMember.getUser().getFullName(),groupMember.getUser().getEmail(),groupMember.getMemberRole());}
    private GroupMessageResponse messageResponse(GroupDiscussion message){return new GroupMessageResponse(message.getId(),message.getMessage(),message.getAuthor().getFullName(),message.getCreatedAt());}
}
