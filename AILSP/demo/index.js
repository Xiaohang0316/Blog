const code  = `
const a = 1 
const b = 2
function sum(a, b) {
  console.log('ccc');
  return a + b
}
console.log(sum(a, b)) `
const aaa = new Function(code)
const ddd = aaa()
console.log(ddd);
