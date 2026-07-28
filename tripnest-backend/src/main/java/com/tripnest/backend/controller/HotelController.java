package com.tripnest.backend.controller;

import com.tripnest.backend.service.HotelService;

import org.springframework.web.bind.annotation.RestController;

import com.tripnest.backend.entity.Hotel;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;

import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@RestController
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @PostMapping("/add")
    public Hotel addHotel(@RequestBody Hotel hotel) {

        System.out.println("Image received: " + hotel.getImage());


        return hotelService.addHotel(hotel);
    }

    @GetMapping("/all")
    public List<Hotel> getAllHotels() {
        return hotelService.getAllHotels();
    }

    @GetMapping("/hotel/{id}")
    public Hotel getHotelById(@PathVariable Long id) {

        return hotelService.getHotelById(id);

    }

    @PutMapping("/hotel/{id}")
    public Hotel updateHotel(@PathVariable Long id,
            @RequestBody Hotel updatedHotel) {

        return hotelService.updateHotel(id, updatedHotel);
    }

    @DeleteMapping("/hotel/{id}")
    public String deleteHotel(@PathVariable Long id) {

        hotelService.deleteHotel(id);

        return "Hotel deleted successfully!";
    }
}