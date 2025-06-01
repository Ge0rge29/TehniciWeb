DROP TYPE IF EXISTS categ_produs;
DROP TYPE IF EXISTS subcategorie_produs;
DROP TYPE IF EXISTS tipuri_produse;

CREATE TYPE categ_produs AS ENUM('greutati', 'fishing', 'echipament', 'accesorii', 'diverse'); -- max 5 valori
CREATE TYPE subcategorie_produs AS ENUM('standard', 'profesional', 'editie_limitata', 'pentru_copii', 'oferta_speciala');
CREATE TYPE tipuri_produse AS ENUM('gantere', 'undite', 'rachete', 'mingi', 'altele'); -- pentru eventuale extinderi

CREATE TABLE IF NOT EXISTS produse_sportive (
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   greutate INT NOT NULL CHECK (greutate>=0),   
   tip_produs tipuri_produse DEFAULT 'gantere',
   durabilitate INT NOT NULL CHECK (durabilitate>=0),
   categorie categ_produs DEFAULT 'diverse',
   subcategorie subcategorie_produs DEFAULT 'standard',
   etichete TEXT, -- valori multiple, separate prin virgula (ex: 'carbon,portabil,impermeabil')
   culoare VARCHAR(30), -- o singura valoare (ex: 'rosu', 'negru', etc.)
   pentru_incepatori BOOLEAN NOT NULL DEFAULT FALSE,
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT INTO produse_sportive (nume, descriere, pret, greutate, tip_produs, durabilitate,
    categorie, subcategorie, etichete, culoare, pentru_incepatori, imagine)
VALUES 
-- GREUTATI
('Ganteră 5kg basic', 'Pentru începători', 60, 5000, 'gantere', 75,
 'greutati', 'standard', 'fier,cauciuc', 'negru', TRUE, 'gantera-5kg-basic.png'),

('Ganteră 10kg profesională', 'Pentru antrenament serios', 120, 10000, 'gantere', 95,
 'greutati', 'profesional', 'otel,cauciuc dur', 'rosu', FALSE, 'gantera-10kg-pro.png'),

('Set gantere limitat', 'Ediție exclusivă, doar 50 de bucăți', 250, 15000, 'gantere', 85,
 'greutati', 'editie_limitata', 'otel,plastic,colectie', 'gri', FALSE, 'set-gantere-limitat.png'),

-- FISHING
('Undiță copii plastic', 'Ușor de folosit de cei mici', 50, 500, 'undite', 60,
 'fishing', 'pentru_copii', 'plastic,usoara,portabila', 'albastru', TRUE, 'undita-copii.png'),

('Undiță carbon pro', 'Nivel profesional', 300, 800, 'undite', 98,
 'fishing', 'profesional', 'carbon,spuma eva', 'negru', FALSE, 'undita-carbon-pro.png'),

('Undiță promoție', 'Reducere limitată!', 80, 700, 'undite', 70,
 'fishing', 'oferta_speciala', 'carbon,usor,promo', 'verde', TRUE, 'undita-promo.png'),

-- ECHIPAMENT
('Rachetă copii roz', 'Ergonomică și colorată', 90, 300, 'rachete', 75,
 'echipament', 'pentru_copii', 'plastic,spuma', 'roz', TRUE, 'racheta-copii-roz.png'),

('Rachetă standard aluminiu', 'Bună pentru antrenament', 150, 350, 'rachete', 85,
 'echipament', 'standard', 'aluminiu,plastic', 'albastru', TRUE, 'racheta-standard.png'),

('Rachetă ediție limitată', 'Doar pentru colecționari', 600, 320, 'rachete', 97,
 'echipament', 'editie_limitata', 'fibra,carbon,colectie', 'negru', FALSE, 'racheta-limitata.png'),

-- ACCESORII
('Minge tenis promo', 'Set promoțional mingi', 30, 300, 'mingi', 70,
 'accesorii', 'oferta_speciala', 'cauciuc,textil,tenis', 'galben', TRUE, 'minge-tenis.png'),

('Genunchiere sport', 'Protecție la antrenamente', 50, 400, 'altele', 80,
 'accesorii', 'standard', 'textil,elastic', 'negru', TRUE, 'genunchiere.png'),

-- DIVERSE
('Covoraș fitness eco', 'Material reciclabil', 100, 1200, 'altele', 90,
 'diverse', 'editie_limitata', 'spuma,eco,bio', 'verde', FALSE, 'covoras-eco.png'),

('Sticlă sport 1L', 'Rezistentă la impact', 40, 250, 'altele', 85,
 'diverse', 'standard', 'plastic,bpa free', 'portocaliu', TRUE, 'sticla-sport.png'),

('Rucsac multifuncțional', 'Pentru toate echipamentele tale', 180, 1300, 'altele', 95,
 'diverse', 'profesional', 'impermeabil,marime mare', 'negru', FALSE, 'rucsac.png'),

-- ALTE COMBINAȚII
('Minge fotbal copii', 'Dimensiune redusă', 55, 350, 'mingi', 65,
 'accesorii', 'pentru_copii', 'piele sintetica,usoara', 'alb', TRUE, 'minge-fotbal.png'),

('Suport telefon bicicletă', 'Stabil pe orice teren', 65, 200, 'altele', 80,
 'diverse', 'oferta_speciala', 'plastic,silicon', 'negru', TRUE, 'suport-telefon.png'),

('Banda rezistență', 'Pentru antrenamente de forță', 25, 100, 'altele', 60,
 'accesorii', 'standard', 'latex,elastic,culoare rosie', 'rosu', TRUE, 'banda-rezistenta.png');
