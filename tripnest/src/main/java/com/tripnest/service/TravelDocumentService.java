package com.tripnest.service;
import com.tripnest.dto.TravelDocumentResponse;
import com.tripnest.entity.TravelDocument;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.TravelDocumentRepository;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.scheduling.annotation.Scheduled;

@Service @Transactional
public class TravelDocumentService {
    private static final Set<String> DOCUMENT_TYPES = Set.of("Ticket", "Hotel Booking", "Travel Document", "Photo");
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("application/pdf","image/jpeg","image/png","image/webp","application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    private final TravelDocumentRepository documents; private final TripRepository trips; private final TripMemberRepository members; private final UserRepository users; private final Path root; private final int retentionDays;
    public TravelDocumentService(TravelDocumentRepository documents, TripRepository trips, TripMemberRepository members, UserRepository users, @Value("${app.upload-dir:uploads}") String uploadDirectory, @Value("${app.upload-retention-days:365}") int retentionDays) { this.documents=documents; this.trips=trips; this.members=members; this.users=users; this.root=Path.of(uploadDirectory).toAbsolutePath().normalize();this.retentionDays=Math.max(30,retentionDays); }
    public TravelDocumentResponse upload(String email,Long tripId,String documentType,MultipartFile file){Trip trip=accessible(email,tripId);if(file==null||file.isEmpty())throw new RuntimeException("Select a file to upload");if(file.getSize()>MAX_FILE_SIZE)throw new RuntimeException("Files must be 10 MB or smaller");if(!DOCUMENT_TYPES.contains(documentType))throw new RuntimeException("Unsupported document type");if(!ALLOWED_CONTENT_TYPES.contains(file.getContentType()))throw new RuntimeException("Unsupported file type. Upload PDF, DOCX, JPG, PNG, or WEBP files only");String original=Path.of(file.getOriginalFilename()==null?"file":file.getOriginalFilename()).getFileName().toString();String key=UUID.randomUUID()+extension(original);try{Files.createDirectories(root);try(var input=file.getInputStream()){Files.copy(input,root.resolve(key),StandardCopyOption.REPLACE_EXISTING);}}catch(IOException exception){throw new RuntimeException("Could not store uploaded file");}TravelDocument document=new TravelDocument(null,original,key,documentType,file.getContentType(),file.getSize(),LocalDateTime.now(),trip,user(email));return response(documents.save(document));}
    public List<TravelDocumentResponse> list(String email,Long tripId){accessible(email,tripId);return documents.findByTripIdOrderByUploadedAtDesc(tripId).stream().map(this::response).toList();}
    public TravelDocument getForDownload(String email,Long tripId,Long documentId){accessible(email,tripId);return documentForTrip(tripId,documentId);}
    public Resource resource(TravelDocument document){try{Resource resource=new UrlResource(root.resolve(document.getStorageKey()).toUri());if(!resource.exists())throw new RuntimeException("Stored file is unavailable");return resource;}catch(MalformedURLException exception){throw new RuntimeException("Stored file is unavailable");}}
    public void delete(String email,Long tripId,Long documentId){TravelDocument document=documentForTrip(tripId,documentId);if(!document.getUploadedBy().getEmail().equals(email)&&!trips.findById(tripId).filter(t->t.getUser().getEmail().equals(email)).isPresent())throw new RuntimeException("Only the uploader or trip owner can delete this document");try{Files.deleteIfExists(root.resolve(document.getStorageKey()));}catch(IOException ignored){}documents.delete(document);}
    private TravelDocument documentForTrip(Long tripId,Long id){return documents.findById(id).filter(d->d.getTrip().getId().equals(tripId)).orElseThrow(()->new RuntimeException("Document not found"));}
    private Trip accessible(String email,Long tripId){return trips.findById(tripId).filter(t->t.getUser().getEmail().equals(email)||members.findByTripIdAndUserEmail(tripId,email).isPresent()).orElseThrow(()->new RuntimeException("Trip not found"));}
    private User user(String email){return users.findByEmail(email).orElseThrow(()->new RuntimeException("User not found"));}
    private String extension(String filename){int dot=filename.lastIndexOf('.');return dot>=0?filename.substring(dot):"";}
    @Scheduled(cron="0 15 3 * * *") public void purgeExpiredLocalFiles(){LocalDateTime cutoff=LocalDateTime.now().minusDays(retentionDays);documents.findAll().stream().filter(d->d.getUploadedAt().isBefore(cutoff)).forEach(d->{try{Files.deleteIfExists(root.resolve(d.getStorageKey()));}catch(IOException ignored){}documents.delete(d);});}
    private TravelDocumentResponse response(TravelDocument document){return new TravelDocumentResponse(document.getId(),document.getTrip().getId(),document.getOriginalFilename(),document.getDocumentType(),document.getContentType(),document.getFileSize(),document.getUploadedBy().getFullName(),document.getUploadedAt());}
}
