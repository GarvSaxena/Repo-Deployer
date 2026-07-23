import { createClient } from 'redis';

async function main() {
    const client = createClient();
    await client.connect();
    
    // Check queue length
    const queueLen = await client.lLen('build-queue');
    console.log(`build-queue length: ${queueLen}`);

    // Check recent statuses
    const keys = await client.keys('*');
    console.log(`All keys in Redis:`, keys);

    if (keys.includes('status')) {
        const statuses = await client.hGetAll('status');
        console.log(`Statuses:`, statuses);
    }
    
    await client.disconnect();
}
main().catch(console.error);
