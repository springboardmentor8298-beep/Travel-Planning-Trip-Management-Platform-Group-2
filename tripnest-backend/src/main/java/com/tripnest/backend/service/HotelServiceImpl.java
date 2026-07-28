package com.tripnest.backend.service;

import com.tripnest.backend.entity.Hotel;
import com.tripnest.backend.exception.HotelNotFoundException;
import com.tripnest.backend.repository.HotelRepository;

import java.util.List;

import org.springframework.stereotype.Service;


@Service
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;

    public HotelServiceImpl(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    @Override
    public Hotel addHotel(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    @Override
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    @Override
    public Hotel getHotelById(Long id) {
        return hotelRepository.findById(id)
        .orElseThrow(() -> new HotelNotFoundException("Hotel not found"));
    }

    @Override
    public Hotel updateHotel(Long id, Hotel updatedHotel) {

        Hotel hotel = hotelRepository.findById(id).get();

        hotel.setName(updatedHotel.getName());
        hotel.setCity(updatedHotel.getCity());
        hotel.setPrice(updatedHotel.getPrice());
        hotel.setRating(updatedHotel.getRating());

        return hotelRepository.save(hotel);
    }

    @Override
    public void deleteHotel(Long id) {
        hotelRepository.deleteById(id);
    }

}