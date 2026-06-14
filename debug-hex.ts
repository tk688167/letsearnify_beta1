
import { base58ToHex } from "./lib/tron";

const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const HEX_FROM_LOG = "41a614f803b6fd780986a42c78ec9c7f77e6ded13c";

const calculatedHex = base58ToHex(USDT_CONTRACT);
console.log("Calculated:", calculatedHex);
console.log("Log Hex:   ", HEX_FROM_LOG);
console.log("Match:", calculatedHex.toLowerCase() === HEX_FROM_LOG.toLowerCase());
