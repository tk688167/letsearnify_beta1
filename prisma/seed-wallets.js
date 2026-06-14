
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding wallets...')

  const wallets = [
    {
      network: 'TRC20',
      address: 'TMXUP3y6hL8amGc4SnAMhyhMKW9PRKTEth',
      qrCodePath: '/qr-placeholder.png' // Default placeholder
    },
    {
      network: 'BEP20',
      address: '0x39Ca8dE5795AdE004eB1E7C6cA1171eaEC832CF4',
      qrCodePath: '/qr-placeholder.png'
    }
  ]

  for (const wallet of wallets) {
    const existingWallet = await prisma.platformWallet.findUnique({
      where: { network: wallet.network }
    })

    if (!existingWallet) {
      await prisma.platformWallet.create({
        data: wallet
      })
      console.log(`Created ${wallet.network} wallet: ${wallet.address}`)
    } else {
      // Upsert to ensure address matches requirement
      await prisma.platformWallet.update({
        where: { network: wallet.network },
        data: { address: wallet.address }
      })
      console.log(`Updated ${wallet.network} wallet: ${wallet.address}`)
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
