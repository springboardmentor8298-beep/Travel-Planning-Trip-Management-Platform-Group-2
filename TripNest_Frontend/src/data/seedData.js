// Realistic Seed Data for TripNest

export const initialProfile = {
  name: "Raju Prasad",
  email: "raju@tripnest.com",
  phone: "+1 (555) 019-2834",
  country: "United States",
  bio: "Passionate globetrotter, slow traveler, and frontend developer. Always looking for the next hidden gem and local culinary experience. Believer that travel is about the journey, not just the destination.",
  photo: null, // Initial fallback to initials "RP"
  travelStyle: "Cultural Immersion", // Cultural, Adventure, Luxury, Budget, Relaxing
  emergencyContact: "Anjali Prasad (+1 (555) 019-5678)"
};

export const initialTrips = [
  {
    id: "trip-italy",
    title: "Italian Coast & Cuisine",
    destination: "Amalfi Coast & Rome, Italy",
    startDate: "2026-07-05", // Active: covers today's date 2026-07-09
    endDate: "2026-07-15",
    budget: 8000,
    expenses: [
      { id: "exp-it-1", title: "Rome Boutique Hotel", category: "Lodging", amount: 2400, date: "2026-07-05" },
      { id: "exp-it-2", title: "Amalfi Cliffside Villa", category: "Lodging", amount: 3500, date: "2026-07-08" },
      { id: "exp-it-3", title: "Flights (NYC to Rome)", category: "Transport", amount: 1100, date: "2026-07-05" },
      { id: "exp-it-4", title: "Colosseum Tour Guide", category: "Activities", amount: 150, date: "2026-07-06" },
      { id: "exp-it-5", title: "Trattoria Da Enzo Dinner", category: "Food", amount: 120, date: "2026-07-06" },
      { id: "exp-it-6", title: "Train Rome to Salerno", category: "Transport", amount: 80, date: "2026-07-08" },
      { id: "exp-it-7", title: "Positano Boat Tour", category: "Activities", amount: 250, date: "2026-07-10" }
    ],
    travelers: [
      { id: "trav-1", name: "Raju Prasad", email: "raju@tripnest.com", role: "Organizer" },
      { id: "trav-2", name: "Anjali Prasad", email: "anjali@family.com", role: "Traveler" },
      { id: "trav-3", name: "Aria Chen", email: "aria@tripnest.com", role: "Traveler" }
    ],
    itinerary: [
      {
        day: 1,
        date: "2026-07-05",
        activities: [
          { id: "act-it-1", time: "08:30 AM", title: "Arrive in Rome (FCO)", description: "Pick up bags, take Leonardo Express train to Termini station.", cost: 35, type: "Transport" },
          { id: "act-it-2", time: "11:00 AM", title: "Check-in at Hotel Navona", description: "Drop bags, grab quick espresso and cornetto.", cost: 10, type: "Relaxation" },
          { id: "act-it-3", time: "03:00 PM", title: "Piazza Navona Walking Tour", description: "See Bernini's fountains and explore local shops.", cost: 0, type: "Sightseeing" }
        ]
      },
      {
        day: 2,
        date: "2026-07-06",
        activities: [
          { id: "act-it-4", time: "09:00 AM", title: "Colosseum & Forum Entry", description: "Skipping the lines with a pre-booked guided historical tour.", cost: 150, type: "Sightseeing" },
          { id: "act-it-5", time: "01:30 PM", title: "Lunch at Armando al Pantheon", description: "Authentic Roman Cacio e Pepe and Carbonara.", cost: 80, type: "Dining" },
          { id: "act-it-6", time: "08:00 PM", title: "Dinner in Trastevere", description: "Walk across the Tiber and dine under fairy lights.", cost: 120, type: "Dining" }
        ]
      },
      {
        day: 3,
        date: "2026-07-07",
        activities: [
          { id: "act-it-7", time: "10:00 AM", title: "Vatican Museums & Sistine Chapel", description: "Stunning Renaissance art, Michelangelo's masterpiece.", cost: 70, type: "Sightseeing" },
          { id: "act-it-8", time: "04:30 PM", title: "Trevi Fountain & Gelato", description: "Toss a coin into the fountain and get pistachio gelato.", cost: 15, type: "Relaxation" }
        ]
      },
      {
        day: 4,
        date: "2026-07-08",
        activities: [
          { id: "act-it-9", time: "09:30 AM", title: "Frecciarossa Train to Salerno", description: "Fast train from Rome Termini to Salerno port.", cost: 80, type: "Transport" },
          { id: "act-it-10", time: "01:00 PM", title: "Ferry to Amalfi town", description: "Scenic ferry ride. High cliffs and blue waters.", cost: 25, type: "Transport" },
          { id: "act-it-11", time: "03:00 PM", title: "Check-in Cliffside Villa", description: "Unpack and admire the ocean view from the balcony.", cost: 0, type: "Relaxation" }
        ]
      }
    ],
    documents: [
      { id: "doc-it-1", name: "Alitalia_Flight_Confirm.pdf", type: "Ticket", size: "245 KB", uploadedAt: "2026-06-15" },
      { id: "doc-it-2", name: "Amalfi_Villa_Voucher.pdf", type: "Hotel Booking", size: "189 KB", uploadedAt: "2026-06-20" },
      { id: "doc-it-3", name: "Travel_Insurance_Policy.pdf", type: "Insurance", size: "1.2 MB", uploadedAt: "2026-07-01" }
    ],
    notes: "Remember: Roman taxis only accept cash sometimes, verify before boarding. Always pre-book major museum passes."
  },
  {
    id: "trip-switzerland",
    title: "Swiss Alps Adventure",
    destination: "Zermatt & Interlaken, Switzerland",
    startDate: "2026-08-10", // Upcoming: starts in future
    endDate: "2026-08-20",
    budget: 9500,
    expenses: [
      { id: "exp-ch-1", title: "Swiss Travel Pass (10 Days)", category: "Transport", amount: 650, date: "2026-08-10" },
      { id: "exp-ch-2", title: "Zermatt Chalet Booking", category: "Lodging", amount: 4800, date: "2026-08-10" },
      { id: "exp-ch-3", title: "Paragliding in Interlaken", category: "Activities", amount: 280, date: "2026-08-15" }
    ],
    travelers: [
      { id: "trav-1", name: "Raju Prasad", email: "raju@tripnest.com", role: "Organizer" },
      { id: "trav-4", name: "Oliver Wood", email: "oliver@nature.com", role: "Traveler" }
    ],
    itinerary: [
      {
        day: 1,
        date: "2026-08-10",
        activities: [
          { id: "act-ch-1", time: "09:00 AM", title: "Arrive Zurich Airport", description: "Validate Swiss Travel Pass at station, board scenic train to Visp, then Zermatt.", cost: 0, type: "Transport" },
          { id: "act-ch-2", time: "03:00 PM", title: "Chalet Check-in", description: "Unpack at Chalet McKinley. View of Matterhorn.", cost: 0, type: "Relaxation" }
        ]
      },
      {
        day: 2,
        date: "2026-08-11",
        activities: [
          { id: "act-ch-3", time: "08:00 AM", title: "Gornergrat Cogwheel Railway", description: "Ascend to Gornergrat summit for stunning views of 29 peaks.", cost: 120, type: "Sightseeing" },
          { id: "act-ch-4", time: "01:00 PM", title: "Riffelsee Lake Hike", description: "Short downhill hike to see the reflection of the Matterhorn in the lake.", cost: 0, type: "Activities" }
        ]
      }
    ],
    documents: [
      { id: "doc-ch-1", name: "Swiss_Travel_Pass.pdf", type: "Ticket", size: "512 KB", uploadedAt: "2026-07-05" },
      { id: "doc-ch-2", name: "Chalet_McKinley_Booking.pdf", type: "Hotel Booking", size: "298 KB", uploadedAt: "2026-07-06" }
    ],
    notes: "Mountain weather is unpredictable. Keep an eye on live webcams before booking expensive peak cable cars. Pack warm windbreakers even in August."
  },
  {
    id: "trip-japan",
    title: "Historic Japan Explorer",
    destination: "Tokyo & Kyoto, Japan",
    startDate: "2026-05-15", // Completed: already ended
    endDate: "2026-05-25",
    budget: 7200,
    expenses: [
      { id: "exp-jp-1", title: "Shinkansen Tickets (RT)", category: "Transport", amount: 280, date: "2026-05-18" },
      { id: "exp-jp-2", title: "Tokyo Capsule & Ryokan Hotels", category: "Lodging", amount: 3200, date: "2026-05-15" },
      { id: "exp-jp-3", title: "Sushi Cooking Class", category: "Activities", amount: 150, date: "2026-05-16" },
      { id: "exp-jp-4", title: "Michelin Ramen Dinner", category: "Food", amount: 75, date: "2026-05-17" },
      { id: "exp-jp-5", title: "Souvenirs from Akihabara", category: "Other", amount: 500, date: "2026-05-22" }
    ],
    travelers: [
      { id: "trav-1", name: "Raju Prasad", email: "raju@tripnest.com", role: "Organizer" }
    ],
    itinerary: [
      {
        day: 1,
        date: "2026-05-15",
        activities: [
          { id: "act-jp-1", time: "03:00 PM", title: "Check-in Shinjuku Hotel", description: "Arrived at Tokyo Haneda airport, took limousine bus to Shinjuku.", cost: 30, type: "Relaxation" },
          { id: "act-jp-2", time: "07:00 PM", title: "Omoide Yokocho Food Stalls", description: "Sampled local yakitori and beers in the historic narrow alleys.", cost: 45, type: "Dining" }
        ]
      },
      {
        day: 2,
        date: "2026-05-16",
        activities: [
          { id: "act-jp-3", time: "09:00 AM", title: "Senso-ji Temple in Asakusa", description: "Tokyo's oldest Buddhist temple, walked Nakamise shopping street.", cost: 0, type: "Sightseeing" },
          { id: "act-jp-4", time: "01:00 PM", title: "Sushi Making Workshop", description: "Taught by a local chef how to shape nigiri and roll sushi.", cost: 150, type: "Activities" }
        ]
      }
    ],
    documents: [
      { id: "doc-jp-1", name: "Japan_Visa_Approved.pdf", type: "Other", size: "432 KB", uploadedAt: "2026-04-10" },
      { id: "doc-jp-2", name: "Ryokan_Kyoto_Booking.pdf", type: "Hotel Booking", size: "340 KB", uploadedAt: "2026-04-20" }
    ],
    notes: "Extremely reliable trains, always be exactly on time. Cash is still highly used in small traditional shops and shrines. Get a digital Suica card for transit."
  }
];

export const initialSettings = {
  appearance: "light",
  language: "English",
  notifications: {
    emailAlerts: true,
    tripReminders: true,
    budgetAlerts: true
  }
};
