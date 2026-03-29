
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.platformWallet.update({
    where: { network: 'BEP20' },
    data: { qrCodePath: '/bnb-qr.png' }
  })
  console.log('Updated BEP20 QR Code Path')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
