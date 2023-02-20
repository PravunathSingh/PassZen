#!/usr/bin/env node

const inquirer = require('inquirer');
const yargs = require('yargs');
const chalk = require('chalk');
const { version } = require('./package.json');
const fs = require('fs');
const clipboardy = require('clipboardy');

const filePath = `${process.env.HOME}/Desktop/passwords.txt`;

const smallAlphabets = 'abcdefghijklmnopqrstuvwxyz';
const capitalAlphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '0123456789';
const specialCharacters = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

const { argv } = yargs(process.argv.slice(2));

const checkFlags = () => {
  if (argv.h || argv.help) {
    // display the list of commands in the terminal in the form of a table
    console.table([
      {
        command: 'generate',
        description:
          'Generate a new password based on predefined rules or custom rules',
      },
      {
        command: 'delete',
        description:
          'Delete a password from the password file based on the key provided',
      },
      {
        command: '-l, --list',
        description:
          'List all the passwords in the password file in the terminal',
      },
      {
        command: '-v, --version',
        description: 'Display the version of the CLI',
      },
      {
        command: '-h, --help',
        description: 'Display the list of commands',
      },
    ]);

    process.exit(0);
  } else if (argv.v || argv.version) {
    console.log(version);
    process.exit(0);
  } else if (argv.l || argv.list) {
    const data = fs.readFileSync(filePath, 'utf8');

    const lines = data.split('\n');

    const filteredLines = lines.filter((line) => line !== '' && line !== ' ');
    const passwords = filteredLines.map((line) => {
      const [key, password] = line.split(' - ');
      return { key, password };
    });

    console.table(passwords);

    process.exit(0);
  }
};

checkFlags();

const passGenLogic = (strength, key, passLength) => {
  const loopLength = strength === 'strong' ? 2 : 1;
  const smallAlphabetsArr = smallAlphabets.split('');
  const capitalAlphabetsArr = capitalAlphabets.split('');
  const numbersArr = numbers.split('');
  const specialCharactersArr = specialCharacters.split('');

  const smallAlphabetsRandom = [];
  const capitalAlphabetsRandom = [];
  const numbersRandom = [];
  const specialCharactersRandom = [];

  for (let i = 0; i < loopLength; i++) {
    const randomSmallAlphabet =
      smallAlphabetsArr[Math.floor(Math.random() * smallAlphabetsArr.length)];
    const randomCapitalAlphabet =
      strength === 'strong' || 'medium'
        ? capitalAlphabetsArr[
            Math.floor(Math.random() * capitalAlphabetsArr.length)
          ]
        : '';
    const randomNumber =
      numbersArr[Math.floor(Math.random() * numbersArr.length)];
    const randomSpecialCharacter =
      strength === 'strong' || 'medium'
        ? specialCharactersArr[
            Math.floor(Math.random() * specialCharactersArr.length)
          ]
        : '';

    smallAlphabetsRandom.push(randomSmallAlphabet);
    capitalAlphabetsRandom.push(randomCapitalAlphabet);
    numbersRandom.push(randomNumber);
    specialCharactersRandom.push(randomSpecialCharacter);
  }

  const pass = [
    ...smallAlphabetsRandom,
    ...capitalAlphabetsRandom,
    ...numbersRandom,
    ...specialCharactersRandom,
    key,
  ];

  return pass.join('').slice(0, passLength);
};

const generatePassword = (strength, key) => {
  const strongPassLen = 12; // will contain at least 2 capital letters, 2 numbers, 2 special characters 2 small letters and the key
  const mediumPassLen = 8; // will contain at least 1 capital letter, 1 number, 1 special character 1 small letter and the key
  const weakPassLen = 6; // will contain at least, 1 number, 1 small letter and the key

  if (strength === 'strong') {
    return passGenLogic(strength, key, strongPassLen);
  } else if (strength === 'medium') {
    return passGenLogic(strength, key, mediumPassLen);
  } else if (strength === 'weak') {
    return passGenLogic(strength, key, weakPassLen);
  }

  return 'Invalid Strength';
};

const generateRandomPassword = (
  key,
  capitalAlphabetsLength,
  smallAlphabetsLength,
  numbersLength,
  symbolsLength
) => {
  const pass = [];

  const capitalAlphabetsArr = capitalAlphabets.split('');
  const smallAlphabetsArr = smallAlphabets.split('');
  const numbersArr = numbers.split('');
  const specialCharactersArr = specialCharacters.split('');

  const capitalAlphabetsRandom = [];
  const smallAlphabetsRandom = [];
  const numbersRandom = [];
  const specialCharactersRandom = [];

  for (let i = 0; i < capitalAlphabetsLength; i++) {
    const randomCapitalAlphabet =
      capitalAlphabetsArr[
        Math.floor(Math.random() * capitalAlphabetsArr.length)
      ];
    capitalAlphabetsRandom.push(randomCapitalAlphabet);
  }

  for (let i = 0; i < smallAlphabetsLength; i++) {
    const randomSmallAlphabet =
      smallAlphabetsArr[Math.floor(Math.random() * smallAlphabetsArr.length)];
    smallAlphabetsRandom.push(randomSmallAlphabet);
  }

  for (let i = 0; i < numbersLength; i++) {
    const randomNumber =
      numbersArr[Math.floor(Math.random() * numbersArr.length)];
    numbersRandom.push(randomNumber);
  }

  for (let i = 0; i < symbolsLength; i++) {
    const randomSpecialCharacter =
      specialCharactersArr[
        Math.floor(Math.random() * specialCharactersArr.length)
      ];
    specialCharactersRandom.push(randomSpecialCharacter);
  }

  pass.push(...capitalAlphabetsRandom);
  pass.push(...smallAlphabetsRandom);
  pass.push(...numbersRandom);
  pass.push(...specialCharactersRandom);
  pass.push(key);

  return pass.join('');
};

const questions = [
  {
    type: 'list',
    name: 'options',
    message: chalk.greenBright('How Do You Want To Generate Your Password?'),
    choices: [
      chalk.bold.blueBright('With predefined rules'),
      new inquirer.Separator(),
      chalk.bold.magentaBright('With custom rules'),
    ],
  },
];

const checkIfKeyExists = (key, strength, password) => {
  if (fs.existsSync(filePath, 'passwords.txt')) {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split(' ');
    const line = lines.find((line) => line.includes(key));
    if (line) {
      console.log(
        chalk.bold.redBright(
          'Key already exists. Please enter a new unique key and try again'
        )
      );
      return true;
    } else {
      fs.appendFileSync(
        filePath,
        `${key} - ${password} (${strength}) \n`,
        'utf8'
      );
    }
  } else {
    fs.appendFileSync(
      filePath,
      `${key} - ${password} (${strength}) \n`,
      'utf8'
    );
  }
};

const startProcess = async () => {
  const { options } = await inquirer.prompt(questions);

  if (options === chalk.bold.blueBright('With predefined rules')) {
    const predefinedQuestions = [
      {
        type: 'list',
        name: 'predefinedOptions',
        message: chalk.greenBright('Select the predefined rules'),
        choices: [
          chalk.bold.blueBright('Strong'),
          new inquirer.Separator(),
          chalk.bold.magentaBright('Medium'),
          new inquirer.Separator(),
          chalk.bold.yellowBright('Weak'),
        ],
      },
    ];

    const { predefinedOptions } = await inquirer.prompt(predefinedQuestions);
    const key = await inquirer.prompt([
      {
        type: 'input',
        name: 'key',
        message: chalk.magentaBright(
          'Enter a 4 character key to identify your password'
        ),
        validate: (value) => {
          if (value.length === 4) {
            return true;
          }
          return 'Please enter a 4 character key';
        },
      },
    ]);

    if (predefinedOptions === chalk.bold.blueBright('Strong')) {
      const strongPass = generatePassword('strong', key.key);
      //  create a numbered list of passwords generated along with the key in the following format 1. key - password and save it to a file on the desktop of the user.

      if (checkIfKeyExists(key.key, 'strong', strongPass)) return;

      clipboardy.writeSync(strongPass);

      console.log(
        chalk.greenBright(
          'Password generated successfully. Check your desktop for the file'
        )
      );
    } else if (predefinedOptions === chalk.bold.magentaBright('Medium')) {
      const mediumPass = generatePassword('medium', key.key);

      if (checkIfKeyExists(key.key, 'medium', mediumPass)) return;

      console.log(
        chalk.greenBright(
          'Password generated successfully. Check your desktop for the file'
        )
      );
    } else if (predefinedOptions === chalk.bold.yellowBright('Weak')) {
      const weakPass = generatePassword('weak', key.key);

      if (checkIfKeyExists(key.key, 'weak', weakPass)) return;

      console.log(
        chalk.greenBright(
          'Password generated successfully. Check your desktop for the file'
        )
      );
    }
  } else if (options === chalk.bold.magentaBright('With custom rules')) {
    const customQuestions = [
      {
        type: 'input',
        name: 'key',
        message: chalk.blueBright(
          'Enter a 4 character key to identify your password'
        ),
        validate: (value) => {
          if (value.length === 4) {
            return true;
          }
          return 'Please enter a 4 character key';
        },
      },
      {
        type: 'text',
        name: 'capitalAlphabets',
        message: chalk.yellowBright(
          'Enter the number capital alphabets you want to include in your password'
        ),
        validate: (value) => {
          if (value > 0) {
            return true;
          }
          return 'Please enter a number greater than 0';
        },
      },
      {
        type: 'text',
        name: 'smallAlphabets',
        message: chalk.greenBright(
          'Enter the number small alphabets you want to include in your password'
        ),
        validate: (value) => {
          if (value > 0) {
            return true;
          }
          return 'Please enter a number greater than 0';
        },
      },
      {
        type: 'text',
        name: 'numbers',
        message: chalk.blueBright(
          'Enter the number of numbers you want to include in your password'
        ),
        validate: (value) => {
          if (value > 0) {
            return true;
          }
          return 'Please enter a number greater than 0';
        },
      },
      {
        type: 'text',
        name: 'symbols',
        message: chalk.magentaBright(
          'Enter the number of symbols you want to include in your password'
        ),
        validate: (value) => {
          if (value > 0) {
            return true;
          }
          return 'Please enter a number greater than 0';
        },
      },
    ];

    const { key, capitalAlphabets, smallAlphabets, numbers, symbols } =
      await inquirer.prompt(customQuestions);

    const customPass = generateRandomPassword(
      key,
      capitalAlphabets,
      smallAlphabets,
      numbers,
      symbols
    );

    if (checkIfKeyExists(key, 'custom', customPass)) return;

    console.log(
      chalk.greenBright(
        'Password generated successfully. Check your desktop for the file'
      )
    );
  }
};

const deleteKey = async () => {
  const key = await inquirer.prompt([
    {
      type: 'input',
      name: 'key',
      message: chalk.magentaBright(
        'Enter the key of the password you want to delete'
      ),
      validate: (value) => {
        if (value.length === 4) {
          return true;
        }
        return 'Please enter a 4 character key';
      },
    },
  ]);

  if (fs.existsSync(filePath, 'passwords.txt')) {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split(' ');

    if (lines.find((line) => line.includes(key.key))) {
      console.log(chalk.bold.magentaBright('Key found. Deleting password...'));

      setTimeout(() => {
        console.log(chalk.bold.greenBright('Password deleted successfully'));
      }, 500);

      const newData = data.replace(
        new RegExp(`${key.key} - .* \\(.*\\)`, 'g'),
        ''
      );

      fs.writeFileSync(filePath, newData, 'utf8');
    } else {
      console.log(
        chalk.bold.redBright(
          'Key does not exist. Please enter a valid key and try again'
        )
      );
    }
  } else {
    console.log(
      chalk.bold.redBright(
        'No passwords have been generated. Please generate a password first'
      )
    );
  }
};

if (argv._[0] === 'delete') {
  deleteKey();
  return;
}

if (argv._[0] === 'generate') {
  startProcess();
} else {
  console.log(
    chalk.bold.redBright(
      'Invalid command. Please use the help command to see the list of commands'
    )
  );
}
