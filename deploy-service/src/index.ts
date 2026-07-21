import {createClient, commandOptions} from "redis"
const subscriber = createClient();
async function main() {
  while (1) { // infiinitly run this, to pull data from local redis
    const response = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );

    console.log(response);
  }
}

main();