
const TRONGRID_API_URL = "https://api.trongrid.io";
const API_KEY = "126cfdb9-2232-4f59-a1fe-8b3c6819db28";
const TX_ID = "2274e3e9c4dc0b1e1dbb20a812e87e7a454a44d23eed728c1ed314f2e41a7828";

async function verify() {
    console.log(`Verifying ${TX_ID}...`);
    try {
        const response = await fetch(`${TRONGRID_API_URL}/wallet/gettransactionbyid`, {
            method: "POST",
            headers: {
                "TRON-PRO-API-KEY": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ value: TX_ID })
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Body:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
}

verify();
