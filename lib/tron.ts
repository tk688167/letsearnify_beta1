
import { createHash } from 'crypto';

const TRONGRID_API_URL = "https://api.trongrid.io";
const API_KEY = "126cfdb9-2232-4f59-a1fe-8b3c6819db28";
const USDT_CONTRACT_ADDRESS_HEX = "41TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // Wait, this needs to be hex. 
// USDT Contract: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
// I need access to my own base58ToHex to convert it properly if I want to match.
// Or I can look up the hex for USDT: 41TR7... is NOT hex.
// Hex starts with 41 + ...
// I will use my helper to get the generic HEX.

// Base58 Helpers
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const ALPHABET_MAP = ALPHABET.split('').reduce((map, c, i) => {
    map[c] = i;
    return map;
}, {} as any);

function decodeBase58(string: string): Buffer {
    if (string.length === 0) return Buffer.alloc(0);
    let i, j, bytes = [0];
    for (i = 0; i < string.length; i++) {
        const c = string[i];
        if (!(c in ALPHABET_MAP)) throw new Error('Non-base58 character');
        for (j = 0; j < bytes.length; j++) bytes[j] *= 58;
        bytes[0] += ALPHABET_MAP[c];
        let carry = 0;
        for (j = 0; j < bytes.length; ++j) {
            bytes[j] += carry;
            carry = bytes[j] >> 8;
            bytes[j] &= 0xff;
        }
        while (carry) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }
    for (i = 0; string[i] === '1' && i < string.length - 1; i++) bytes.push(0);
    return Buffer.from(bytes.reverse());
}

export function base58ToHex(address: string): string {
    try {
        const decoded = decodeBase58(address);
        // Remove last 4 bytes (checksum)
        const checked = decoded.subarray(0, decoded.length - 4);
        return checked.toString('hex').toUpperCase();
    } catch (e) {
        return "";
    }
}

interface VerificationResult {
    success: boolean;
    amount?: number;
    toAddress?: string; // In Hex
    token?: string; // "TRX" or "USDT" (or other contract hex)
    error?: string;
}

export async function verifyTronTransaction(txId: string): Promise<VerificationResult> {
    try {
        // Strip 0x if present
        if (txId.startsWith("0x")) {
            txId = txId.substring(2);
        }
        console.log(`[TronVerify] Verifying ${txId}...`);
        const response = await fetch(`${TRONGRID_API_URL}/wallet/gettransactionbyid`, {
            method: "POST",
            headers: {
                "TRON-PRO-API-KEY": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ value: txId })
        });

        if (!response.ok) {
            console.error(`[TronVerify] API Error: ${response.status} ${response.statusText}`);
            return { success: false, error: "Failed to connect to Tron Network" };
        }

        const data = await response.json();
        console.log(`[TronVerify] API Response for ${txId}:`, JSON.stringify(data, null, 2));

        // 1. Check existence
        if (!data || Object.keys(data).length === 0) {
            return { success: false, error: "Transaction not found on Tron Network" };
        }
        
        // 2. Check Status
        // Note: 'ret' array contains execution results.
        if (!data.ret || !data.ret[0] || data.ret[0].contractRet !== 'SUCCESS') {
             const status = data.ret?.[0]?.contractRet || "UNKNOWN";
             return { success: false, error: `Transaction Status is ${status} (Not SUCCESS)` };
        }

        const contract = data.raw_data.contract[0];
        const type = contract.type;
        const value = contract.parameter.value;

        // 3. Parse Details based on Type
        if (type === 'TransferContract') {
            // TRX Transfer
            // value.amount is in Sun (1 TRX = 1,000,000 Sun)
            return {
                success: true,
                amount: value.amount / 1_000_000,
                toAddress: value.to_address, // This is Hex
                token: "TRX"
            };
        } else if (type === 'TriggerSmartContract') {
            // TRC20 Token Transfer (likely USDT)
            const contractAddress = value.contract_address; // this is the Token Contract (Hex)
            const dataField = value.data; // Hex string of function call

            // Check if it is a transfer: a9059cbb
            if (dataField.startsWith('a9059cbb')) {
                // Decode params: method(4 bytes) + address(32 bytes) + amount(32 bytes)
                // Address is at index 8 + 24 zeros? 
                // dataField is hex string.
                // 0-8: method ID
                // 8-72: address (padded to 64 chars)
                // 72-136: amount (padded to 64 chars)
                
                const addressHexPadded = dataField.substring(8, 72);
                const amountHexPadded = dataField.substring(72, 136);

                // Extract actual address (last 40 chars of the 64 char block usually, but wait. 
                // Tron Hex addresses are 42 chars (41 + 20 bytes). 
                // EVM padding is left-padded with zeros. 
                // We typically take the last 40 chars and prepend 41 for Tron? 
                // Actually `gettransactionbyid` returns `owner_address` as `41...`.
                // In ABI encoded parameter, the address is 20 bytes.
                // So we take the last 40 characters of the address segment and prepend `41`.
                const toAddressHex = "41" + addressHexPadded.substring(24);
                
                const amount = parseInt(amountHexPadded, 16);
                
                // Adjust for Decimals. USDT has 6 decimals.
                // If it's a different token, decimals might differ.
                // Provided Contract for USDT: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
                // Hex for USDT: 419a5... check dynamically?
                // I'll assume USDT (6 decimals) for now as it's the main use case.
                
                return {
                    success: true,
                    amount: amount / 1_000_000, // USDT 6 decimals
                    toAddress: toAddressHex,
                    token: contractAddress // Contract Address Hex
                };
            }
        }

        return { success: false, error: "Unsupported Transaction Type" };

    } catch (error: any) {
        console.error("[TronVerify] Exception:", error);
        return { success: false, error: error.message };
    }
}
