function shift(registers, alphabet) {
  registers[0]++;

  for (let i = 1; i < registers.length; ++i) {
    if (registers[i - 1] >= alphabet.length) {
      registers[i]++;
      registers[i - 1] = 0;
    }
  }
}

function formString(registers, alphabet) {
  return registers.reduce((acc, index) => acc + alphabet.charAt(index), "");
}

onmessage = (event) => {
  const password = event.data.password;
  const alphabet = event.data.alphabet;
  const registers = new Array(password.length).fill(0);

  const startTime = performance.now();

  while (true) {
    if (formString(registers, alphabet) === password) {
      postMessage({
        result: formString(registers, alphabet),
        time: performance.now() - startTime,
      });
      break;
    }
    shift(registers, alphabet);
  }
};
