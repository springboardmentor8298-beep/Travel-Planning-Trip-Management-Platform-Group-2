import { useState,  useEffect } from "react";

import { useParams } from "react-router-dom";

import { getHotelById } from "../services/hotelService";

function Booking() {

    const { id } = useParams();

    console.log(id);

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);

    const [hotel, setHotel] = useState(null);

    const [totalPrice, setTotalPrice] = useState(0);


useEffect(() => {

    const fetchHotel = async () => {

        try {

            const data = await getHotelById(id);

            setHotel(data);

        } catch (error) {

            console.log(error);

        }

    };

    fetchHotel();

}, [id]);

    useEffect(() => {
      if (!checkIn || !checkOut || !hotel) return;

      const checkInDate = new Date(checkIn);

      const checkOutDate = new Date(checkOut);

      const difference = checkOutDate - checkInDate;

      const nights = difference / (1000 * 60 * 60 * 24);

      setTotalPrice(nights * hotel.price);
    }, [checkIn, checkOut, hotel]);


    if (!hotel) {

        return <h2>Loading...</h2>;

    }

    return (
      <div>
        <h1>Book Your Stay</h1>

        <br />

        <h2>{hotel.name}</h2>

        <p>📍 {hotel.city}</p>

        <h3>₹{hotel.price} / night</h3>

        <hr />

        <label>Check-in Date</label>

        <br />

        <input
          type="date"
          value={checkIn}
          onChange={(event) => setCheckIn(event.target.value)}
        />

        <br />
        <br />

        <label>Check-out Date</label>

        <br />

        <input
          type="date"
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
        />

        <br />
        <br />

        <label>Guests</label>

        <br />

        <input
          type="number"
          min="1"
          value={guests}
          onChange={(event) => setGuests(event.target.value)}
        />

        <br />
        <br />

        <h2>Total Price : ₹{totalPrice}</h2>

        <hr />

        <h3>Booking Summary</h3>

        <p>
          Hotel :<strong> {hotel.name}</strong>
        </p>

        <p>
          Guests :<strong> {guests}</strong>
        </p>

        <p>
          Check-in :<strong> {checkIn || "Not Selected"}</strong>
        </p>

        <p>
          Check-out :<strong> {checkOut || "Not Selected"}</strong>
        </p>

        <p>
          Total :<strong> ₹{totalPrice}</strong>
        </p>

        <button onClick={() => alert("Booking Confirmed!")}>
          Confirm Booking
        </button>
      </div>
    );

}



export default Booking;