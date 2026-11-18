INSERT INTO music_release (id, title, artist, release_year, cover_color) VALUES
    (1, 'Lanterns at Dawn', 'The Paper Satellites', 2021, '#d85b42'),
    (2, 'Blue Hour Signals', 'Mira Sol', 2018, '#486e87'),
    (3, 'Small Rooms, Wide Skies', 'Northbound Letters', 2023, '#899460'),
    (4, 'Soft Static', 'Juniper Arcade', 2016, '#9b7189'),
    (5, 'After the Rainline', 'Mira Sol', 2020, '#bf8a4b'),
    (6, 'Overdose', 'natori', 2022, '#536b72')
ON CONFLICT (id) DO NOTHING;

INSERT INTO music_listing (id, release_id, seller, format, item_condition, price, currency, is_demo) VALUES
    (1, 1, 'Lantern Records', 'VINYL', 'LIKE_NEW', 420000, 'VND', TRUE),
    (2, 1, 'Lantern Records', 'DIGITAL', 'DIGITAL', 90000, 'VND', TRUE),
    (3, 2, 'Blue Room Archive', 'CD', 'GOOD', 180000, 'VND', TRUE),
    (4, 2, 'Mira Sol Store', 'DIGITAL', 'DIGITAL', 75000, 'VND', TRUE),
    (5, 3, 'Northbound Records', 'CASSETTE', 'NEW', 250000, 'VND', TRUE),
    (6, 4, 'Juniper Shelf', 'VINYL', 'FAIR', 310000, 'VND', TRUE),
    (7, 5, 'Mira Sol Store', 'DIGITAL', 'DIGITAL', 80000, 'VND', TRUE),
    (8, 6, 'Melodex Demo Store', 'DIGITAL', 'DIGITAL', 99000, 'VND', TRUE)
ON CONFLICT (id) DO NOTHING;

UPDATE music_listing SET is_demo = TRUE
WHERE seller IN ('Lantern Records', 'Blue Room Archive', 'Mira Sol Store',
                 'Northbound Records', 'Juniper Shelf');

SELECT setval(pg_get_serial_sequence('music_release', 'id'), GREATEST((SELECT MAX(id) FROM music_release), 1));
SELECT setval(pg_get_serial_sequence('music_listing', 'id'), GREATEST((SELECT MAX(id) FROM music_listing), 1));

