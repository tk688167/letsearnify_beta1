
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.platformWallet.update({
    where: { network: 'TRC20' },
    data: { qrCodePath: '/trc20-qr.png' }
  })
  console.log('Updated TRC20 QR Code Path')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
