const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pools = await prisma.mudarabahPool.findMany();
  console.log(pools);
}
main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
