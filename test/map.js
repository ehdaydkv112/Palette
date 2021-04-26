const counter = new Map()

const data = [
  { value: "1", name: "교석" },
  { value: "1", name: "형석" },
  { value: "3", name: "태진" },
  { value: "1", name: "유진" },
  { value: "1", name: "항해" },
  { value: "5", name: "99" },
]

const emoji = data.reduce((tot, val) => {
  const res = tot.get(val["value"])
  res ? res.push(val["name"]) : tot.set(val["value"], [val["name"]])
  return tot
}, counter)

console.log(emoji)
