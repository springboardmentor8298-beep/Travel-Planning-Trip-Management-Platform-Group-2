-- Seed data for the Destination Discovery System.
-- Only inserts if the table is empty, so this is safe to leave in place
-- permanently without duplicating rows on every restart.
INSERT INTO destinations (name, country, description, image_url, popular_attractions)
SELECT * FROM (SELECT
    'Goa' AS name,
    'India' AS country,
    'A coastal paradise known for its beaches, nightlife, and Portuguese-influenced architecture.' AS description,
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80' AS image_url,
    'Baga Beach, Fort Aguada, Basilica of Bom Jesus, Anjuna Flea Market' AS popular_attractions
UNION ALL SELECT
    'Manali', 'India',
    'A Himalayan resort town famous for adventure sports, snow-capped mountains, and river valleys.',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    'Solang Valley, Rohtang Pass, Hadimba Temple, Old Manali'
UNION ALL SELECT
    'Jaipur', 'India',
    'The Pink City - a showcase of royal Rajasthani heritage, forts, and vibrant bazaars.',
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    'Amber Fort, Hawa Mahal, City Palace, Jal Mahal'
UNION ALL SELECT
    'Kerala Backwaters', 'India',
    'A serene network of lagoons and canals, best explored by houseboat through Alleppey and Kumarakom.',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    'Alleppey Houseboats, Kumarakom Bird Sanctuary, Vembanad Lake'
UNION ALL SELECT
    'Bali', 'Indonesia',
    'An island of temples, rice terraces, and beaches, blending nature with rich Balinese culture.',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    'Tanah Lot Temple, Ubud Monkey Forest, Tegallalang Rice Terraces, Uluwatu'
UNION ALL SELECT
    'Paris', 'France',
    'The City of Light - iconic art, architecture, and cuisine along the Seine.',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    'Eiffel Tower, Louvre Museum, Notre-Dame, Montmartre'
UNION ALL SELECT
    'Tokyo', 'Japan',
    'A dazzling fusion of ultramodern skyscrapers and centuries-old temples.',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    'Shibuya Crossing, Senso-ji Temple, Tokyo Tower, Akihabara'
UNION ALL SELECT
    'Santorini', 'Greece',
    'Whitewashed cliffside villages overlooking the deep blue Aegean Sea.',
    'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=80',
    'Oia Sunset Point, Fira Town, Red Beach, Akrotiri Ruins'
UNION ALL SELECT
    'Swiss Alps', 'Switzerland',
    'Dramatic peaks, alpine lakes, and postcard-perfect villages year-round.',
    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
    'Matterhorn, Jungfraujoch, Lake Lucerne, Interlaken'
UNION ALL SELECT
    'New York City', 'United States',
    'The city that never sleeps - iconic skyline, Broadway, and world-class museums.',
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    'Times Square, Central Park, Statue of Liberty, Empire State Building'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM destinations LIMIT 1);
