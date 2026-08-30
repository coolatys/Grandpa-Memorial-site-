-- Clear the old timeline events
DELETE FROM timeline_events;

-- Insert the new timeline events
INSERT INTO timeline_events (year, title, description, sort_order) VALUES
('4 February 1948', 'Birth in Zaria', 'Born in Zaria, Northern Nigeria, to Pa Idowu Adewusi John of Lemo Compound, Iperu Remo, and Chief Mrs. Janet Olateju John (née Okukenu) of the Okukenu Royal Ruling House of Abeokuta.', 1),

('1950s', 'Primary Education at UMC Molete', 'Completed his primary schooling at the United Missionary College (UMC) in Molete, Ibadan, where his mother served as an Assistant Head/Teacher.', 2),

('Late 1950s – 1960s', 'Secondary Schooling', 'Began secondary education at Methodist High School, Ibadan, before completing his studies as a boarder at Oke Ona Grammar School, Abeokuta.', 3),

('Late 1960s', 'Technical Education & Certification', 'Trained in the electrical trade at Government Technical College, Ikoyi, Lagos, earning the City and Guilds Craft Certificate.', 4),

('1970s – Early 1980s', 'Early Career: P&T, ECN, and Folawiyo Cement', 'Started his career in the Sorting Department of the Post and Telecommunications (P&T) Department at Marina, Lagos.<br><br>Joined the Electricity Corporation of Nigeria (ECN, later NEPA) in Ibadan to expand his practical electrical expertise.<br><br>Worked as an electrical technician at Folawiyo Cement Company in Lagos.', 5),

('1984 – 1986', 'Touring Technician for King Sunny Ade', 'Served as the electrical technician for King Sunny Ade and his band, diagnosing, repairing, and maintaining musical instruments and electronic stage equipment.', 6),

('Late 1980s onward', 'Private Enterprise in Telecommunications', 'Ventured into private entrepreneurship, running his own independent telecommunications installation business.', 7),

('Mid-Life', 'Spiritual Discipleship', 'Enrolled in Pastor Tunde Bakare''s Bible School to pursue advanced scriptural and theological study, building upon his lifelong roots in the Methodist Church.', 8),

('~15 Years Before Passing', 'Relocation to Iperu Remo', 'Relocated permanently to his ancestral hometown of Iperu Remo to unite the extended descendants of his grandparents (Pa Odutola Kagbure John and Madam Taiwo Kagbure John) and preserve family heritage.', 9);
