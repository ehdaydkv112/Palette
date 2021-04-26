let person = {
  name: "kks",
  age: "27",
  married: false,
  img: "/hello",
}

const img = null
const filter = img ? { ...person, img } : { ...person }
console.log(person)
