
// scripts/verify-get-all.ts
import { getAllCountries } from '../app/actions/admin/merchant-settings'

async function test() {
    console.log("Fetching all countries...")
    const countries = await getAllCountries()
    console.log(`Fetched ${countries.length} countries.`)
    
    if (countries.length > 0) {
        console.log("First country:", countries[0])
        const pk = countries.find((c: any) => c.code === 'PK')
        console.log("Pakistan check:", pk)
    }
}

test()
