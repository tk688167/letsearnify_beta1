import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MLM_COUNTRIES = [
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
    status: "ACTIVE",
    currency: "INR",
    methods: ["Paytm", "PhonePe", "Google Pay", "UPI", "Bank Transfer"],
    description: "Deposit using popular Indian payment methods via authorized local merchants.",
    instruction: "⚠️ Always verify merchant identity before transferring funds. Use only the WhatsApp contacts provided."
  },
  {
    name: "Bangladesh",
    code: "BD",
    status: "ACTIVE",
    currency: "BDT",
    methods: ["bKash", "Nagad", "Rocket", "Bank Transfer"],
    description: "Deposit through trusted Bangladeshi mobile money services and bank transfers.",
    instruction: "⚠️ Confirm all transactions with merchant before depositing. Keep transaction references safe."
  },
  {
    name: "Nepal",
    code: "NP",
    status: "ACTIVE",
    currency: "NPR",
    methods: ["eSewa", "Khalti", "IME Pay", "Bank Transfer"],
    description: "Use Nepali digital wallets and bank transfers for your deposits.",
    instruction: "⚠️ Verify merchant details before payment. Contact support if you have any doubts."
  },
  {
    name: "UAE",
    code: "AE",
    status: "ACTIVE",
    currency: "AED",
    methods: ["Bank Transfer", "Cash Deposit"],
    description: "Deposit via UAE bank transfers or authorized cash deposit centers.",
    instruction: "⚠️ For cash deposits, only use authorized collection centers. Always get a receipt."
  },
  {
    name: "USA",
    code: "US",
    status: "ACTIVE",
    currency: "USD",
    methods: ["Zelle", "CashApp", "Venmo", "Bank Transfer"],
    description: "Deposit using popular US payment apps and bank transfers.",
    instruction: "⚠️ Only send to merchant accounts listed on this page. Verify identity before transferring."
  },
  {
    name: "UK",
    code: "GB",
    status: "ACTIVE",
    currency: "GBP",
    methods: ["Bank Transfer", "PayPal"],
    description: "Deposit via UK bank transfer or PayPal through authorized merchants.",
    instruction: "⚠️ Always confirm merchant bank details before transfer. Keep payment confirmations."
  }
]

async function seedMerchantCountries() {
  console.log('🌍 Starting MLM merchant countries seeding...\n')

  for (const countryData of MLM_COUNTRIES) {
    console.log(`📍 Processing ${countryData.name} (${countryData.code})...`)
    
    // Check if country already exists
    const existing = await prisma.merchantCountry.findFirst({
      where: { 
        OR: [
          { code: countryData.code },
          { name: countryData.name }
        ]
      }
    })

    if (existing) {
      console.log(`   ℹ️  ${countryData.name} already exists, skipping...`)
      continue
    }

    // Create country
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

    console.log(`   ✅ Created country: ${country.name}`)

    // Add payment methods
    for (const methodName of countryData.methods) {
      await prisma.merchantPaymentMethod.create({
        data: {
          name: methodName,
          countryId: country.id
        }
      })
      console.log(`      💳 Added payment method: ${methodName}`)
    }

    console.log('')
  }

  console.log('✅ MLM merchant countries seeding completed!')
  console.log('\n📊 Summary:')
  
  const totalCountries = await prisma.merchantCountry.count()
  const totalMethods = await prisma.merchantPaymentMethod.count()
  
  console.log(`   Total Countries: ${totalCountries}`)
  console.log(`   Total Payment Methods: ${totalMethods}`)
  console.log('\n💡 Next steps:')
  console.log('   1. Go to /admin/settings/merchant to manage countries')
  console.log('   2. Add merchant contacts for each country')
  console.log('   3. Users can now select their country in wallet deposits/withdrawals')
}

seedMerchantCountries()
  .then(() => {
    console.log('\n🎉 Done!')
    prisma.$disconnect()
  })
  .catch((error) => {
    console.error('❌ Error seeding merchant countries:', error)
    prisma.$disconnect()
    process.exit(1)
  })
