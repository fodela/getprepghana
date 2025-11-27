import db from "./index";

console.log("Adding demo facility...");

const insertFacility = db.prepare("INSERT INTO facilities (name, region_id, latitude, longitude, address, phone) VALUES (?, ?, ?, ?, ?, ?)");
const insertContact = db.prepare("INSERT INTO contact_people (facility_id, name, role, phone_number) VALUES (?, ?, ?, ?)");
const insertStock = db.prepare("INSERT INTO drug_stocks (facility_id, drug_name, status) VALUES (?, ?, ?)");

// Eastern Regional Hospital Data
const facility = {
    name: "Eastern Regional Hospital",
    region: "EASTERN",
    lat: 6.0940,
    lng: -0.2610,
    address: "Koforidua",
    phone: "+233 34 202 3456"
};

const contact = {
    name: "John Mensah",
    role: "Key Contact Person", // Or "Medical Superintendent" if preferred
    phone: "0200000000"
};

try {
    // Insert Facility
    const info = insertFacility.run(facility.name, facility.region, facility.lat, facility.lng, facility.address, facility.phone);
    const facilityId = info.lastInsertRowid;

    // Insert Contact Person
    insertContact.run(facilityId, contact.name, contact.role, contact.phone);

    // Insert Drug Stock (Assuming available for demo)
    insertStock.run(facilityId, "PrEP (Tenofovir/Emtricitabine)", "available");

    console.log(`Successfully added ${facility.name} with contact ${contact.name}`);
} catch (error) {
    console.error("Error adding demo facility:", error);
}
