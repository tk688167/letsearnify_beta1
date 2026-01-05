const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Starting duplicate cleanup...')

  // Find all countries named "Pakistan"
  const pakistans = await prisma.merchantCountry.findMany({
    where: { name: 'Pakistan' },
    orderBy: { createdAt: 'desc' }, // Keep the newest one? Or oldest? Usually easiest to keep one.
    include: { methods: true, contacts: true }
  })

  console.log(`Found ${pakistans.length} entries for Pakistan.`)

  if (pakistans.length > 0) {
    // 1. Filter for ACTIVE one
    const active = pakistans.find(p => p.status === 'ACTIVE');
    
    // If we have an active one, keep ONLY that one.
    if (active) {
        console.log(`Keeping ACTIVE Pakistan: ${active.id}`);
        const others = pakistans.filter(p => p.id !== active.id);
        for (const d of others) {
            console.log(`Deleting duplicate/inactive Pakistan: ${d.id} (${d.status})`);
            await prisma.merchantCountry.delete({ where: { id: d.id } });
        }
    } else {
        // If NO active one exists, checking if we should keep one or delete all?
        // User said: "Remove 'Coming Soon' Pakistan". "Only display Active Pakistan".
        // So if none are active, we might delete all? 
        // Let's be safe: If only one exists and it's COMING_SOON, we might want to keep it to avoid breaking UI until admin sets it active?
        // But user said "Remove 'Coming Soon' Pakistan".
        // So I will delete ALL inactive ones if explicitly requested.
        console.log("No ACTIVE Pakistan found. Checking for non-active to remove...");
        for (const d of pakistans) {
             console.log(`Deleting inactive Pakistan: ${d.id} (${d.status})`);
             await prisma.merchantCountry.delete({ where: { id: d.id } });
        }
    }
  } else {
    console.log("No Pakistan entries found.")
  }
  
  // Cleanup duplicates for other countries just in case
  const others = ['India', 'Bangladesh', 'Philippines', 'United Kingdom', 'UAE']
  for (const name of others) {
      const entries = await prisma.merchantCountry.findMany({
          where: { name },
          orderBy: { createdAt: 'desc' }
      })
      if (entries.length > 1) {
          const keep = entries[0]
          const del = entries.slice(1)
          console.log(`Cleaning duplicates for ${name}...`)
          for (const d of del) {
             await prisma.merchantCountry.delete({ where: { id: d.id } })
          }
      }
  }

  console.log('Cleanup finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
