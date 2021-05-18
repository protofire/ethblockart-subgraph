import { integer } from '@protofire/subgraph-toolkit'

import { Counter } from '../../generated/schema'

export function getCounter(id: string): Counter {
  let counter = Counter.load(id)

  if (counter == null) {
    counter = new Counter(id)
    counter.value = integer.ZERO
  }

  return counter!
}

export function increaseCounter(id: string): Counter {
  let counter = getCounter(id)
  counter.value = integer.increment(counter.value)
  counter.save()

  return counter
}
