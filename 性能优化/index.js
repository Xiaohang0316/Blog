const arr = Array.from({ length: 100_000_000 }, (_, i) => i);
console.time("forEach");

  let total = 0;
  arr.forEach(num => {
    total += num;
  });

console.timeEnd("forEach");



// console.time("while");

// let total = 0;
// let i = 0;
// while (i < arr.length) {
//   total += arr[i];
//   i++;
// }

// console.timeEnd("while");