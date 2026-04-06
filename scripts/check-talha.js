require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkUser() {
    const user = await p.user.findUnique({
        where: { email: 'tk688167@gmail.com' }
    });
    console.log('--- USER DATA ---');
    console.log('Email:', user.email);
    console.log('Member ID:', user.memberId);
    console.log('Referral Code:', user.referralCode);
    console.log('-----------------');
    await p.$disconnect();
}

checkUser();
