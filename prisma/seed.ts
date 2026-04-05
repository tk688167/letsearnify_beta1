import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...\n')

  // 1. Create Admin User
  console.log('👤 Creating admin user...')
  const hashedPassword = await bcrypt.hash('admin@123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@letsearnify.com' },
    update: {},
    create: {
      email: 'admin@letsearnify.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      referralCode: 'ADMIN001',
      emailVerified: new Date(),
      tier: 'DIAMOND',
      isActiveMember: true,
      balance: 10000,
      arnBalance: 10000
    }
  })
  console.log('✅ Admin user created:')
  console.log('   📧 Email: admin@letsearnify.com')
  console.log('   🔑 Password: admin123')
  console.log('   🎯 Role: ADMIN\n')

  // 2. Seed Merchant Countries
  console.log('🌍 Seeding merchant countries...')
  const countries = [
    {
      name: "Pakistan",
      code: "PK",
      status: "ACTIVE",
      currency: "PKR",
      methods: ["Easypaisa", "JazzCash", "Bank Transfer", "UBL Omni"],
      description: "Deposit using local Pakistani payment methods through our authorized merchants.",
      instruction: "⚠️ Only send payments to verified merchant contacts listed below. Do not send money to anyone else claiming to be a merchant."
    },
    {
      name: "India",
      code: "IN",
      status: "COMING_SOON",
      currency: "INR",
      methods: ["Paytm", "PhonePe", "Google Pay", "UPI", "Bank Transfer"],
      description: "Deposit using popular Indian payment methods via authorized local merchants.",
      instruction: "⚠️ Always verify merchant identity before transferring funds. Use only the WhatsApp contacts provided."
    },
    {
      name: "Bangladesh",
      code: "BD",
      status: "COMING_SOON",
      currency: "BDT",
      methods: ["bKash", "Nagad", "Rocket", "Bank Transfer"],
      description: "Deposit through trusted Bangladeshi mobile money services and bank transfers.",
      instruction: "⚠️ Confirm all transactions with merchant before depositing. Keep transaction references safe."
    },
    {
      name: "Nepal",
      code: "NP",
      status: "COMING_SOON",
      currency: "NPR",
      methods: ["eSewa", "Khalti", "IME Pay", "Bank Transfer"],
      description: "Use Nepali digital wallets and bank transfers for your deposits.",
      instruction: "⚠️ Verify merchant details before payment. Contact support if you have any doubts."
    },
    {
      name: "UAE",
      code: "AE",
      status: "COMING_SOON",
      currency: "AED",
      methods: ["Bank Transfer", "Cash Deposit"],
      description: "Deposit via UAE bank transfers or authorized cash deposit centers.",
      instruction: "⚠️ For cash deposits, only use authorized collection centers. Always get a receipt."
    },
    {
      name: "USA",
      code: "US",
      status: "COMING_SOON",
      currency: "USD",
      methods: ["Zelle", "CashApp", "Venmo", "Bank Transfer"],
      description: "Deposit using popular US payment apps and bank transfers.",
      instruction: "⚠️ Only send to merchant accounts listed on this page. Verify identity before transferring."
    },
    {
      name: "UK",
      code: "GB",
      status: "COMING_SOON",
      currency: "GBP",
      methods: ["Bank Transfer", "PayPal"],
      description: "Deposit via UK bank transfer or PayPal through authorized merchants.",
      instruction: "⚠️ Always confirm merchant bank details before transfer. Keep payment confirmations."
    }
  ]

  for (const countryData of countries) {
    const existing = await prisma.merchantCountry.findFirst({
      where: { code: countryData.code }
    })

    if (!existing) {
      const country = await prisma.merchantCountry.create({
        data: {
          name: countryData.name,
          code: countryData.code,
          status: countryData.status,
          currency: countryData.currency,
          description: countryData.description,
          instruction: countryData.instruction,
          withdrawalDescription: `Withdraw your earnings via local ${countryData.name} payment methods.`,
          withdrawalInstruction: "⚠️ Provide your correct payment details. Processing time: 24-48 hours."
        }
      })

      for (const methodName of countryData.methods) {
        await prisma.merchantPaymentMethod.create({
          data: {
            name: methodName,
            countryId: country.id
          }
        })
      }
      console.log(`   ✅ ${country.name} (${countryData.methods.length} methods)`)
    }
  }

  // 3. Create Platform Wallets (for deposits)
  console.log('\n💰 Creating platform wallets...')
  const wallets = [
    { network: 'TRC20', address: 'TYourUSDTAddressHere' },
    { network: 'ERC20', address: '0xYourUSDTAddressHere' },
    { network: 'BTC', address: 'bc1YourBTCAddressHere' }
  ]

  for (const wallet of wallets) {
    await prisma.platformWallet.upsert({
      where: { network: wallet.network },
      update: {},
      create: {
        network: wallet.network,
        address: wallet.address
      }
    })
    console.log(`   ✅ ${wallet.network}`)
  }

  console.log('\n✨ Database seeding completed!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 ADMIN CREDENTIALS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Email:    admin@letsearnify.com')
  console.log('Password: admin123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e: any) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
