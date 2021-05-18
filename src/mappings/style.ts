import { Address, dataSource } from '@graphprotocol/graph-ts'
import { address, decimal, integer } from '@protofire/subgraph-toolkit'

import { BlockStyle, Transfer } from '../../generated/BlockStyle/BlockStyle'

import { Style, Token } from '../../generated/schema'

import { getOrRegisterAccount } from '../services/accounts'
import { increaseCounter } from '../services/counters'
import { increaseBalance } from '../services/balances'

export function handleStyleTransfer(event: Transfer): void {
  if (address.isZeroAddress(event.params.from)) {
    let stylesContract = BlockStyle.bind(event.address)

    let creator = getOrRegisterAccount(event.params.to)
    let token = getStylesToken(event.address.toHexString())

    // Style minted
    let style = new Style(event.params.tokenId.toString())
    style.token = token.id
    style.tokenId = event.params.tokenId
    style.creator = creator.id
    style.feeBalance = decimal.ZERO
    style.metadata = stylesContract.tokenURI(event.params.tokenId)
    style.owner = creator.id
    style.addedAt = event.block.timestamp
    style.addedAtBlock = event.block.number
    style.addedAtTransaction = event.transaction.hash
    style.save()

    // Update style token supply
    token.supply = integer.increment(token.supply)
    token.save()

    increaseCounter('styleCount')
    increaseBalance('treasury', decimal.fromBigInt(event.transaction.value))
  } else {
    let style = Style.load(event.params.tokenId.toString())

    if (style != null) {
      let newOwner = getOrRegisterAccount(event.params.to)

      // Style transferred
      style.owner = newOwner.id
      style.save()
    }
  }
}

export function getStylesToken(address: string): Token {
  let token = Token.load(address)

  if (token == null) {
    let stylesContract = BlockStyle.bind(Address.fromString(address))

    token = new Token(address)
    token.address = stylesContract._address
    token.name = stylesContract.name()
    token.symbol = stylesContract.symbol()
    token.supply = integer.ZERO
  }

  return token!
}
