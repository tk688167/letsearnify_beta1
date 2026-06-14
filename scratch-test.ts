import { executeDailyPoolDistribution } from "./lib/daily-pool"

async function test() {
    console.log("Running Daily Pool Distribution Simulation...")
    try {
        const result = await executeDailyPoolDistribution({ force: true })
        console.log("Result:", result)
    } catch (error) {
        console.error("Distribution failed:", error)
    }
}

test()
