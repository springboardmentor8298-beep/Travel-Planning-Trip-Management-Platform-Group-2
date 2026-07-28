package com.tripnest.repository;
import com.tripnest.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> { Optional<GroupMember> findByGroupIdAndUserEmail(Long groupId, String email); List<GroupMember> findByGroupId(Long groupId); }
