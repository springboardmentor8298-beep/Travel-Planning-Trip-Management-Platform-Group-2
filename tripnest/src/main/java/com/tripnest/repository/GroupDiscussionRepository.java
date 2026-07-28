package com.tripnest.repository;
import com.tripnest.entity.GroupDiscussion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface GroupDiscussionRepository extends JpaRepository<GroupDiscussion, Long> { List<GroupDiscussion> findByGroupIdOrderByCreatedAtAsc(Long groupId); }
