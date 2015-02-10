## Services

### Simple Services

#### Dependency Injection

```js
// element.js
class Element
{
  constructor(name, symbol, atomicNumber, atomicWeight) {
    this.name         = name
    this.symbol       = symbol
    this.atomicNumber = atomicNumber
    this.atomicWeight = atomicWeight
  }
}

export default Element
```

```js
// compound.js
class Compound
{
  constructor(name, formula, ...elements) {
    this.name     = name
    this.formula  = formula
    this.elements = elements
  }

  get molarMass() {
    return this.elements
      .map(element => element.atomicWeight)
      .reduce((accumulator, weight) => accumulator + weight)
  }
}

export default Compound
```

```js
// main.js
import Cation   from 'cation'
import Element  from 'element'
import Compound from 'compound'

let container = new Cation()

container.register('Hydrogen', Element, {
  args: ['Hydrogen', 'H', 1, 1.008]
})

container.register('Oxygen', Element, {
  args: ['Oxygen', 'O', 8, 15.999]
})

container.register('Water', Compound, {
  args: ['Water', 'H2O', '@Hydrogen', '@Oxygen', '@Hydrogen']
})

container.get('Water').then(molecule => {
  console.log(molecule.formula) // H2O
  console.log(molecule.molarMass) // 18.015
})
```
