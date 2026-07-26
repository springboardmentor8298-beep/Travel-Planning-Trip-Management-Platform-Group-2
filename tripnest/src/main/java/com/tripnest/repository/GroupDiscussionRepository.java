package com.tripnest.repository;

import com.tripnest.entity.GroupDiscussion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupDiscussionRepository extends JpaRepository<GroupDiscussion, Long> {
    
    List<GroupDiscussion> findByTravelGroupIdOrderByCreatedAtDesc(Long groupId);
}
