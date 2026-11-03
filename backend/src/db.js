const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");

function getDatabasePath() {
  return process.env.DATABASE_PATH || path.join(
    process.env.RAILWAY_VOLUME_MOUNT_PATH || path.resolve(__dirname, "../data"),
    "restaurant.sqlite"
  );
}

function openDatabase(filename = getDatabasePath()) {
  if (filename !== ":memory:") fs.mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename, { timeout: 5000 });
  db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  const version = db.prepare("PRAGMA user_version").get().user_version;
  if (version > 1) throw new Error("Baza pochodzi z nowszej wersji aplikacji.");
  // Numer migracji jest zapisany w pliku bazy; inicjalizacja nie nadpisuje danych.
  if (version === 0) db.exec(`
    BEGIN IMMEDIATE;
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE dishes (
      id INTEGER PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      name TEXT NOT NULL, description TEXT NOT NULL,
      price_grosz INTEGER NOT NULL CHECK (price_grosz >= 0),
      available INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0, 1))
    );
    CREATE TABLE reservations (
      id INTEGER PRIMARY KEY,
      customer_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
      reservation_date TEXT NOT NULL, reservation_time TEXT NOT NULL,
      guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 12),
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX reservations_date_idx ON reservations(reservation_date);
    INSERT INTO categories (id, name, sort_order) VALUES
      (1, 'Przystawki', 1), (2, 'Pizza', 2), (3, 'Desery', 3), (4, 'Napoje', 4);
    INSERT INTO dishes (category_id, name, description, price_grosz) VALUES
      (1, 'Bruschetta', 'Pieczywo, pomidory, bazylia i oliwa.', 2200),
      (1, 'Caprese', 'Mozzarella, pomidory i świeża bazylia.', 2600),
      (1, 'Oliwki', 'Marynowane oliwki z ziołami.', 1400),
      (2, 'Margherita', 'Sos pomidorowy, mozzarella i bazylia.', 3200),
      (2, 'Salame', 'Sos pomidorowy, mozzarella i salami.', 3900),
      (2, 'Funghi', 'Sos pomidorowy, mozzarella i pieczarki.', 3600),
      (2, 'Ortolana', 'Mozzarella i pieczone warzywa sezonowe.', 3800),
      (2, 'Capriciosa', 'Sos pomidorowy, mozzarella, szynka, pieczarki i karczochy.', 4100),
      (2, 'Diablo', 'Sos pomidorowy, mozzarella, pikantne salami i papryczki jalapeño.', 4200),
      (2, 'Fiore', 'Sos pesto, mozzarella, pomidorki koktajlowe i zioła.', 3900),
      (2, 'Gyros', 'Sos pomidorowy, mozzarella, mięso gyros, czerwona cebula i papryka.', 4300),
      (2, 'Hawai', 'Sos pomidorowy, mozzarella, szynka i ananas.', 3800),
      (2, 'Peperoni', 'Sos pomidorowy, mozzarella i salami peperoni.', 4000),
      (2, 'Prosciutto', 'Sos pomidorowy, mozzarella, szynka prosciutto, bakłażan i bazylia.', 4400),
      (2, 'Spinaci', 'Sos pomidorowy, mozzarella, szpinak, kukurydza i czarne oliwki.', 3900),
      (2, 'Torino', 'Sos pomidorowy, szynka dojrzewająca, rukola, parmezan i czarne oliwki.', 4500),
      (3, 'Tiramisu', 'Deser kawowy z kremem mascarpone.', 2400),
      (3, 'Panna cotta', 'Śmietankowy deser z sosem owocowym.', 2100),
      (4, 'Lemoniada', 'Cytryna, mięta i woda gazowana, 400 ml.', 1600),
      (4, 'Espresso', 'Klasyczna włoska kawa, 30 ml.', 1000),
      (4, 'Woda', 'Woda mineralna, 330 ml.', 800);
    PRAGMA user_version = 1;
    COMMIT;
  `);
  return db;
}
module.exports = { getDatabasePath, openDatabase };
