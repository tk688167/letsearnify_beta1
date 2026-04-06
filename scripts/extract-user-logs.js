const fs = require('fs');
const path = require('path');

function extractEmails(content) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return content.match(emailRegex) || [];
}

async function scanLogs() {
    console.log('🔍 Scanning logs for user data...');
    const searchPaths = [
        path.join(__dirname, '..'), // Root
        path.join(__dirname, '..', 'scripts'),
        path.join(__dirname, '..', '.next', 'dev', 'logs')
    ];

    const uniqueEmails = new Set();
    
    for (const searchPath of searchPaths) {
        if (!fs.existsSync(searchPath)) continue;
        
        const files = fs.readdirSync(searchPath);
        for (const file of files) {
            const filePath = path.join(searchPath, file);
            if (fs.statSync(filePath).isFile() && (file.endsWith('.log') || file.endsWith('.txt') || file.endsWith('.json'))) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const emails = extractEmails(content);
                    emails.forEach(email => uniqueEmails.add(email.toLowerCase()));
                    if (emails.length > 0) {
                        console.log(`✅ Found ${emails.length} emails in ${file}`);
                    }
                } catch (e) {}
            }
        }
    }

    console.log('\n--- EXTRACTED USER EMAILS ---');
    Array.from(uniqueEmails).sort().forEach(email => console.log(email));
    console.log(`\nTotal unique emails found: ${uniqueEmails.size}`);
}

scanLogs();
