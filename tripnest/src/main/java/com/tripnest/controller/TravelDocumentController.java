package com.tripnest.controller;
import com.tripnest.dto.TravelDocumentResponse;
import com.tripnest.entity.TravelDocument;
import com.tripnest.service.TravelDocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.List;

@RestController @RequestMapping("/api/trips/{tripId}/documents")
public class TravelDocumentController {
    private final TravelDocumentService service; public TravelDocumentController(TravelDocumentService service){this.service=service;}
    @GetMapping public List<TravelDocumentResponse> list(Principal p,@PathVariable Long tripId){return service.list(p.getName(),tripId);}
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE) @ResponseStatus(HttpStatus.CREATED) public TravelDocumentResponse upload(Principal p,@PathVariable Long tripId,@RequestParam String documentType,@RequestParam MultipartFile file){return service.upload(p.getName(),tripId,documentType,file);}
    @GetMapping("/{documentId}/download") public ResponseEntity<Resource> download(Principal p,@PathVariable Long tripId,@PathVariable Long documentId){TravelDocument document=service.getForDownload(p.getName(),tripId,documentId);MediaType type;try{type=document.getContentType()==null?MediaType.APPLICATION_OCTET_STREAM:MediaType.parseMediaType(document.getContentType());}catch(IllegalArgumentException exception){type=MediaType.APPLICATION_OCTET_STREAM;}return ResponseEntity.ok().contentType(type).header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(document.getOriginalFilename(),StandardCharsets.UTF_8).build().toString()).body(service.resource(document));}
    @DeleteMapping("/{documentId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(Principal p,@PathVariable Long tripId,@PathVariable Long documentId){service.delete(p.getName(),tripId,documentId);}
}
