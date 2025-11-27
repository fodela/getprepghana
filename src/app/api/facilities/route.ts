import db from "../../../db";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region");

    try {
        let query = `
      SELECT 
        f.id, f.name, f.region_id, f.latitude, f.longitude, f.address, f.phone,
        cp.name as contact_name, cp.phone_number as contact_phone,
        ds.status as drug_status
      FROM facilities f
      LEFT JOIN contact_people cp ON f.id = cp.facility_id
      LEFT JOIN drug_stocks ds ON f.id = ds.facility_id AND ds.drug_name LIKE 'PrEP%'
    `;

        const params = [];

        if (region) {
            query += " WHERE f.region_id = ?";
            params.push(region);
        }

        const stmt = db.prepare(query);
        const facilities = stmt.all(...params);

        return Response.json(facilities);
    } catch (error) {
        console.error("Database error:", error);
        return Response.json({ error: "Failed to fetch facilities" }, { status: 500 });
    }
}
