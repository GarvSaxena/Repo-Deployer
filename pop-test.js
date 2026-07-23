import { createClient, commandOptions } from 'redis';

async function main() {
    const subscriber = createClient();
    await subscriber.connect();
    
    console.log("Listening for queue...");
    const res = await subscriber.brPop(
        commandOptions({ isolated: true }),
        'build-queue',
        0
    );
    
    console.log("Popped from queue:", res);
    
    await subscriber.disconnect();
}
main().catch(console.error);
