import db from "./index";
import "./setup";

console.log("Seeding database...");

const regions = [
    "AHAFO", "ASHANTI", "BONO_EAST", "BONO", "CENTRAL", "EASTERN",
    "GREATER_ACCRA", "NORTHERN", "NORTH_EAST", "OTI", "SAVANNAH",
    "UPPER_WEST", "UPPER_EAST", "VOLTA", "WESTERN", "WESTERN_NORTH"
];

// Clear existing data
db.run("DELETE FROM drug_stocks");
db.run("DELETE FROM contact_people");
db.run("DELETE FROM facilities");
// Reset auto-increment counters
db.run("DELETE FROM sqlite_sequence WHERE name='facilities'");
db.run("DELETE FROM sqlite_sequence WHERE name='contact_people'");
db.run("DELETE FROM sqlite_sequence WHERE name='drug_stocks'");

const facilitiesData = [
    { name: "Korle Bu Teaching Hospital", region: "GREATER_ACCRA", lat: 5.5370, lng: -0.2270, address: "Guggisberg Avenue, Accra", phone: "+233 30 266 7759" },
    { name: "Ridge Hospital", region: "GREATER_ACCRA", lat: 5.5595, lng: -0.1975, address: "Castle Rd, Accra", phone: "+233 30 222 8382" },
    { name: "Komfo Anokye Teaching Hospital", region: "ASHANTI", lat: 6.6985, lng: -1.6244, address: "Bantama, Kumasi", phone: "+233 32 202 2301" },
    { name: "Manhyia District Hospital", region: "ASHANTI", lat: 6.7100, lng: -1.6150, address: "Manhyia, Kumasi", phone: "+233 32 202 3456" },
    { name: "Tamale Teaching Hospital", region: "NORTHERN", lat: 9.4020, lng: -0.8330, address: "Tamale", phone: "+233 37 202 2456" },
    { name: "Cape Coast Teaching Hospital", region: "CENTRAL", lat: 5.1160, lng: -1.2460, address: "Cape Coast", phone: "+233 33 213 2456" },
    { name: "Effia Nkwanta Regional Hospital", region: "WESTERN", lat: 4.9010, lng: -1.7650, address: "Sekondi-Takoradi", phone: "+233 31 204 6789" },
    { name: "Ho Teaching Hospital", region: "VOLTA", lat: 6.6120, lng: 0.4710, address: "Ho", phone: "+233 36 202 6789" },
    { name: "Sunyani Regional Hospital", region: "BONO", lat: 7.3450, lng: -2.3210, address: "Sunyani", phone: "+233 35 202 4567" },
    { name: "Koforidua Regional Hospital", region: "EASTERN", lat: 6.0940, lng: -0.2610, address: "Koforidua", phone: "+233 34 202 3456" },
    { name: "Wa Regional Hospital", region: "UPPER_WEST", lat: 10.0600, lng: -2.5020, address: "Wa", phone: "+233 39 202 1234" },
    { name: "Bolgatanga Regional Hospital", region: "UPPER_EAST", lat: 10.7850, lng: -0.8510, address: "Bolgatanga", phone: "+233 38 202 5678" },
    { name: "Goaso Government Hospital", region: "AHAFO", lat: 6.8020, lng: -2.5160, address: "Goaso", phone: "+233 35 209 1234" },
    { name: "Techiman Holy Family Hospital", region: "BONO_EAST", lat: 7.5830, lng: -1.9330, address: "Techiman", phone: "+233 35 252 2345" },
    { name: "Nalerigu Baptist Medical Centre", region: "NORTH_EAST", lat: 10.5260, lng: -0.3680, address: "Nalerigu", phone: "+233 37 209 5678" },
    { name: "Damongo District Hospital", region: "SAVANNAH", lat: 9.0830, lng: -1.8160, address: "Damongo", phone: "+233 37 209 1234" },
    { name: "Worawora Government Hospital", region: "OTI", lat: 7.5330, lng: 0.3660, address: "Worawora", phone: "+233 36 209 1234" },
    { name: "Sefwi Wiawso Government Hospital", region: "WESTERN_NORTH", lat: 6.2000, lng: -2.4830, address: "Sefwi Wiawso", phone: "+233 31 209 1234" }
];

const insertFacility = db.prepare("INSERT INTO facilities (name, region_id, latitude, longitude, address, phone) VALUES (?, ?, ?, ?, ?, ?)");
const insertContact = db.prepare("INSERT INTO contact_people (facility_id, name, role, phone_number) VALUES (?, ?, ?, ?)");
const insertStock = db.prepare("INSERT INTO drug_stocks (facility_id, drug_name, status) VALUES (?, ?, ?)");

for (const fac of facilitiesData) {
    const info = insertFacility.run(fac.name, fac.region, fac.lat, fac.lng, fac.address, fac.phone);
    const facilityId = info.lastInsertRowid;

    insertContact.run(facilityId, `Dr. ${fac.name.split(' ')[0]} Contact`, "Medical Superintendent", "+233 20 000 0000");
    insertStock.run(facilityId, "PrEP (Tenofovir/Emtricitabine)", "available");
    insertStock.run(facilityId, "PEP", Math.random() > 0.8 ? "low" : "available");
}

console.log(`Seeded ${facilitiesData.length} facilities.`);
