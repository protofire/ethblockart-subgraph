import { BigDecimal } from '@graphprotocol/graph-ts'
import { decimal } from '@protofire/subgraph-toolkit'

import { Balance } from '../../generated/schema'

export function getBalance(id: string): Balance {
  let balance = Balance.load(id)

  if (balance == null) {
    balance = new Balance(id)
    balance.value = decimal.ZERO
  }

  return balance!
}

export function decreaseBalance(id: string, value: BigDecimal): Balance {
  let balance = getBalance(id)
  balance.value = balance.value.minus(value)
  balance.save()

  return balance
}

export function increaseBalance(id: string, value: BigDecimal): Balance {
  let balance = getBalance(id)
  balance.value = balance.value.plus(value)
  balance.save()

  return balance
}
