INSERT INTO music_release (id, title, artist, release_year) VALUES
    (1, 'Lanterns at Dawn', 'The Paper Satellites', 2021),
    (2, 'Blue Hour Signals', 'Mira Sol', 2018),
    (3, 'Small Rooms, Wide Skies', 'Northbound Letters', 2023),
    (4, 'Soft Static', 'Juniper Arcade', 2016),
    (5, 'After the Rainline', 'Mira Sol', 2020),
    (6, 'Overdose', 'natori', 2022)
ON CONFLICT (id) DO NOTHING;

-- The fixed IDs above do not advance PostgreSQL's generated-ID sequence.
SELECT setval(
    pg_get_serial_sequence('music_release', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM music_release), 1),
    true
);

-- Curated multilingual pop metadata makes the catalogue useful before recognition is used.
INSERT INTO music_release (external_track_id, title, artist, release_year, genre, language, catalogue_source) VALUES
    ('curated:pop:en:bad-romance', 'Bad Romance', 'Lady Gaga', 2009, 'Pop', 'English', 'CURATED'),
    ('curated:pop:es:despacito', 'Despacito', 'Luis Fonsi feat. Daddy Yankee', 2017, 'Pop', 'Spanish', 'CURATED'),
    ('curated:pop:ko:spring-day', 'Spring Day', 'BTS', 2017, 'Pop', 'Korean', 'CURATED'),
    ('curated:pop:ja:lemon', 'Lemon', 'Kenshi Yonezu', 2018, 'Pop', 'Japanese', 'CURATED'),
    ('curated:pop:vi:see-tinh', 'See Tình', 'Hoàng Thùy Linh', 2022, 'Pop', 'Vietnamese', 'CURATED'),
    ('curated:pop:hi:tum-hi-ho', 'Tum Hi Ho', 'Arijit Singh', 2013, 'Pop', 'Hindi', 'CURATED'),
    ('curated:pop:zh:qi-li-xiang', '七里香', 'Jay Chou', 2004, 'Pop', 'Mandarin Chinese', 'CURATED'),
    ('curated:pop:fr:alors-on-danse', 'Alors on danse', 'Stromae', 2009, 'Pop', 'French', 'CURATED'),
    ('curated:pop:th:rak-tid-siren', 'รักติดไซเรน', 'Ice Paris and Pearwah', 2019, 'Pop', 'Thai', 'CURATED'),
    ('curated:pop:pt:ai-se-eu-te-pego', 'Ai Se Eu Te Pego!', 'Michel Teló', 2011, 'Pop', 'Portuguese', 'CURATED'),
    ('curated:pop:id:hati-hati-di-jalan', 'Hati-Hati di Jalan', 'Tulus', 2022, 'Pop', 'Indonesian', 'CURATED'),
    ('curated:pop:ar:tamally-maak', 'Tamally Maak', 'Amr Diab', 2000, 'Pop', 'Arabic', 'CURATED'),

    ('curated:pop:en:blinding-lights', 'Blinding Lights', 'The Weeknd', 2019, 'Pop', 'English', 'CURATED'),
    ('curated:pop:es:la-camisa-negra', 'La Camisa Negra', 'Juanes', 2004, 'Pop', 'Spanish', 'CURATED'),
    ('curated:pop:ko:ditto', 'Ditto', 'NewJeans', 2022, 'Pop', 'Korean', 'CURATED'),
    ('curated:pop:ja:idol', 'Idol', 'YOASOBI', 2023, 'Pop', 'Japanese', 'CURATED'),
    ('curated:pop:vi:de-mi-noi-cho-ma-nghe', 'Để Mị Nói Cho Mà Nghe', 'Hoàng Thùy Linh', 2019, 'Pop', 'Vietnamese', 'CURATED'),
    ('curated:pop:hi:kesariya', 'Kesariya', 'Arijit Singh', 2022, 'Pop', 'Hindi', 'CURATED'),
    ('curated:pop:zh:qing-hua-ci', '青花瓷', 'Jay Chou', 2007, 'Pop', 'Mandarin Chinese', 'CURATED'),
    ('curated:pop:fr:papoutai', 'Papaoutai', 'Stromae', 2013, 'Pop', 'French', 'CURATED'),
    ('curated:pop:th:tha-rao-jer-kan-eek', 'ถ้าเราเจอกันอีก', 'Tilly Birds', 2021, 'Pop', 'Thai', 'CURATED'),
    ('curated:pop:pt:envolver', 'Envolver', 'Anitta', 2021, 'Pop', 'Portuguese', 'CURATED'),
    ('curated:pop:id:lathi', 'Lathi', 'Weird Genius feat. Sara Fajira', 2020, 'Pop', 'Indonesian', 'CURATED'),
    ('curated:pop:ar:nour-el-ain', 'Nour El Ain', 'Amr Diab', 1996, 'Pop', 'Arabic', 'CURATED'),

    ('curated:pop:en:levitating', 'Levitating', 'Dua Lipa', 2020, 'Pop', 'English', 'CURATED'),
    ('curated:pop:es:bailando', 'Bailando', 'Enrique Iglesias feat. Descemer Bueno and Gente de Zona', 2014, 'Pop', 'Spanish', 'CURATED'),
    ('curated:pop:ko:love-dive', 'LOVE DIVE', 'IVE', 2022, 'Pop', 'Korean', 'CURATED'),
    ('curated:pop:ja:yoru-ni-kakeru', '夜に駆ける', 'YOASOBI', 2019, 'Pop', 'Japanese', 'CURATED'),
    ('curated:pop:vi:nang-tho', 'Nàng Thơ', 'Hoàng Dũng', 2020, 'Pop', 'Vietnamese', 'CURATED'),
    ('curated:pop:hi:kal-ho-naa-ho', 'Kal Ho Naa Ho', 'Sonu Nigam', 2003, 'Pop', 'Hindi', 'CURATED'),
    ('curated:pop:zh:xiao-xing-yun', '小幸运', 'Hebe Tien', 2015, 'Pop', 'Mandarin Chinese', 'CURATED'),
    ('curated:pop:fr:derniere-danse', 'Dernière danse', 'Indila', 2013, 'Pop', 'French', 'CURATED'),
    ('curated:pop:th:wat-pa-la', 'วัดปะหล่ะ', '4EVE', 2021, 'Pop', 'Thai', 'CURATED'),
    ('curated:pop:pt:aquarela', 'Aquarela', 'Toquinho', 1983, 'Pop', 'Portuguese', 'CURATED'),
    ('curated:pop:id:kisah-sempurna', 'Kisah Sempurna', 'Mahalini', 2022, 'Pop', 'Indonesian', 'CURATED'),
    ('curated:pop:ar:3-daqat', '3 Daqat', 'Abu feat. Yousra', 2017, 'Pop', 'Arabic', 'CURATED'),

    ('curated:pop:en:billie-jean', 'Billie Jean', 'Michael Jackson', 1982, 'Pop', 'English', 'CURATED'),
    ('curated:pop:es:vivir-mi-vida', 'Vivir Mi Vida', 'Marc Anthony', 2013, 'Pop', 'Spanish', 'CURATED'),
    ('curated:pop:ko:hype-boy', 'Hype Boy', 'NewJeans', 2022, 'Pop', 'Korean', 'CURATED'),
    ('curated:pop:ja:pretender', 'Pretender', 'Official HIGE DANdism', 2019, 'Pop', 'Japanese', 'CURATED'),
    ('curated:pop:vi:chung-ta-cua-hien-tai', 'Chúng Ta Của Hiện Tại', 'Sơn Tùng M-TP', 2020, 'Pop', 'Vietnamese', 'CURATED'),
    ('curated:pop:hi:chaiyya-chaiyya', 'Chaiyya Chaiyya', 'Sukhwinder Singh and Sapna Awasthi', 1998, 'Pop', 'Hindi', 'CURATED'),
    ('curated:pop:zh:gao-bai-qi-qiu', '告白气球', 'Jay Chou', 2016, 'Pop', 'Mandarin Chinese', 'CURATED'),
    ('curated:pop:fr:je-veux', 'Je veux', 'Zaz', 2010, 'Pop', 'French', 'CURATED'),
    ('curated:pop:th:koisuru-fortune-cookie', 'Koisuru Fortune Cookie', 'BNK48', 2017, 'Pop', 'Thai', 'CURATED'),
    ('curated:pop:pt:boa-sorte', 'Boa Sorte / Good Luck', 'Vanessa da Mata feat. Ben Harper', 2007, 'Pop', 'Portuguese', 'CURATED'),
    ('curated:pop:id:pamit', 'Pamit', 'Tulus', 2016, 'Pop', 'Indonesian', 'CURATED'),
    ('curated:pop:ar:ah-w-noss', 'Ah W Noss', 'Nancy Ajram', 2004, 'Pop', 'Arabic', 'CURATED'),

    ('curated:pop:en:flowers', 'Flowers', 'Miley Cyrus', 2023, 'Pop', 'English', 'CURATED'),
    ('curated:pop:es:tusa', 'Tusa', 'KAROL G feat. Nicki Minaj', 2019, 'Pop', 'Spanish', 'CURATED'),
    ('curated:pop:ko:super-shy', 'Super Shy', 'NewJeans', 2023, 'Pop', 'Korean', 'CURATED'),
    ('curated:pop:ja:first-love', 'First Love', 'Hikaru Utada', 1999, 'Pop', 'Japanese', 'CURATED'),
    ('curated:pop:vi:buoc-qua-mua-co-don', 'Bước Qua Mùa Cô Đơn', 'Vũ.', 2020, 'Pop', 'Vietnamese', 'CURATED'),
    ('curated:pop:hi:srivalli', 'Srivalli', 'Javed Ali', 2021, 'Pop', 'Hindi', 'CURATED'),
    ('curated:pop:zh:ye-qu', '夜曲', 'Jay Chou', 2005, 'Pop', 'Mandarin Chinese', 'CURATED'),
    ('curated:pop:fr:tourner-dans-le-vide', 'Tourner dans le vide', 'Indila', 2014, 'Pop', 'French', 'CURATED'),
    ('curated:pop:th:ting-wai-klang-thang', 'ทิ้งไว้กลางทาง', 'Potato', 2015, 'Pop', 'Thai', 'CURATED'),
    ('curated:pop:pt:anna-julia', 'Anna Júlia', 'Los Hermanos', 1999, 'Pop', 'Portuguese', 'CURATED'),
    ('curated:pop:id:bertau', 'Bertaut', 'Nadin Amizah', 2020, 'Pop', 'Indonesian', 'CURATED'),
    ('curated:pop:ar:ya-tabtab-wa-dallaa', 'Ya Tabtab Wa Dallaa', 'Nancy Ajram', 2006, 'Pop', 'Arabic', 'CURATED')
ON CONFLICT (external_track_id) WHERE external_track_id IS NOT NULL DO NOTHING;

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

