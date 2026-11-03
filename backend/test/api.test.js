const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { openDatabase } = require("../src/db");
const { createApp } = require("../src/app");

test("API: menu, walidacja, zapis i zachowanie danych po ponownym otwarciu", async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "restaurant-test-"));
  const filename = path.join(directory, "test.sqlite");
  let db = openDatabase(filename);
  let server;
  t.after(async () => {
    if (server?.listening) await new Promise(resolve => server.close(resolve));
    db.close();
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith("restaurant-test-"));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  // 11:00 czasu polskiego, niezależnie od strefy czasowej hosta.
  server = createApp(db, { now: () => new Date("2026-10-27T10:00:00Z") }).listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = body => fetch(`${base}/api/reservations`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const menu = await (await fetch(`${base}/api/menu`)).json();
  assert.equal(menu.categories.length, 4);
  assert.equal(menu.categories.flatMap(category => category.dishes).length, 21);
  db.prepare("UPDATE dishes SET available = 0 WHERE id = 1").run();
  const updatedMenu = await (await fetch(`${base}/api/menu`)).json();
  assert.equal(updatedMenu.categories.flatMap(category => category.dishes).length, 20);
  const valid = { customer_name: "Jan Kowalski", email: "jan@example.com", phone: "+48 123 456 789",
    reservation_date: "2026-10-28", reservation_time: "18:30", guests: 4, notes: "Przy oknie" };
  for (const change of [
    { reservation_date: "2026-02-30" }, { reservation_date: "2026-10-26" },
    { reservation_time: "21:00" }, { reservation_time: "18:15" },
    { reservation_time: "25:00" }, { guests: 0 }, { guests: 1.5 }, { guests: "2" },
    { email: "niepoprawny" }, { phone: "123" }, { notes: "a".repeat(1001) },
    { reservation_date: "2026-10-27", reservation_time: "10:30" },
  ]) assert.equal((await post({ ...valid, ...change })).status, 400, JSON.stringify(change));
  assert.equal(db.prepare("SELECT count(*) AS count FROM reservations").get().count, 0);
  // Dzisiejsza przyszła godzina powinna być przyjęta.
  assert.equal((await post({ ...valid, reservation_date: "2026-10-27", reservation_time: "12:00" })).status, 201);
  const response = await post(valid);
  assert.equal(response.status, 201);
  assert.equal((await response.json()).status, "pending");
  assert.equal((await fetch(`${base}/api/reservations`)).status, 404);
  assert.equal((await fetch(`${base}/api/unknown`)).status, 404);
  const malformed = await fetch(`${base}/api/reservations`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
  });
  assert.equal(malformed.status, 400);
  await new Promise(resolve => server.close(resolve));
  db.close();
  db = openDatabase(filename);
  assert.equal(db.prepare("SELECT count(*) AS count FROM reservations").get().count, 2);
  assert.equal(db.prepare("SELECT count(*) AS count FROM dishes").get().count, 21);
  assert.equal(db.prepare("SELECT available FROM dishes WHERE id = 1").get().available, 0);
  assert.equal(db.prepare("SELECT notes FROM reservations WHERE id = 2").get().notes, "Przy oknie");
});
