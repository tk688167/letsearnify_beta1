const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: '123@gmail.com' }
  });
  
  if(!user) {
    console.log('no user');
    return;
  }
  
  console.log('Before Transfer:', {
      balance: user.balance, 
      arn: user.arnBalance, 
      mud: user.mudarabahBalance,
      de: user.dailyEarningWallet
  });

  const usdAmount = 1.0;
  
  // MOCK TRANSFER: Wallet -> Mudarabah
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
          arnBalance: { decrement: usdAmount * 10 },
          balance: { decrement: usdAmount },
          mudarabahBalance: { increment: usdAmount }
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount: usdAmount,
        type: "INVESTMENT",
        status: "COMPLETED",
        method: `Main Wallet -> Mudarabah Pool`,
        description: `Transferred $${usdAmount.toFixed(2)} from Main Wallet to Mudarabah Pool`
      }
    })
  ])

  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
  console.log('After Transfer Wallet -> Mudarabah:', {
     balance: updatedUser.balance, 
     arn: updatedUser.arnBalance, 
     mud: updatedUser.mudarabahBalance,
     de: updatedUser.dailyEarningWallet
  });

  // MOCK TRANSFER: Mudarabah -> Wallet
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
          arnBalance: { increment: usdAmount * 10 },
          balance: { increment: usdAmount },
          mudarabahBalance: { decrement: usdAmount }
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount: usdAmount,
        type: "WITHDRAWAL",
        status: "COMPLETED",
        method: `Mudarabah Pool -> Main Wallet`,
        description: `Transferred $${usdAmount.toFixed(2)} from Mudarabah Pool to Main Wallet`
      }
    })
  ])

  const finalUser = await prisma.user.findUnique({ where: { id: user.id } });
  console.log('After Transfer Mudarabah -> Wallet:', {
     balance: finalUser.balance, 
     arn: finalUser.arnBalance, 
     mud: finalUser.mudarabahBalance,
     de: finalUser.dailyEarningWallet
  });
}
main().finally(() => prisma.$disconnect());
