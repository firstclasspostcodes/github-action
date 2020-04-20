const minimist = require('minimist');

const main = async (argv) => {
  console.log(JSON.stringify(argv, null, '  '));
};

main(minimist(process.argv.slice(2)));
