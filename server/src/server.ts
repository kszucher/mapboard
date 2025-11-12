import { MapBoard } from './mapboard';

async function main() {
  console.time('startup');
  await MapBoard.run({
    port: 8083,
  });
  console.timeEnd('startup');
}

main();
