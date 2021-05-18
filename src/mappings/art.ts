import { Address } from '@graphprotocol/graph-ts'
import { address, decimal, integer } from '@protofire/subgraph-toolkit'

import { BlockArt, Transfer } from '../../generated/BlockArt/BlockArt'
import { BlockStyle } from '../../generated/BlockArt/BlockStyle'

import { Art, ArtMint, ArtTransfer, BlockPrice, Style, Token } from '../../generated/schema'

import { getOrRegisterAccount } from '../services/accounts'
import { increaseCounter } from '../services/counters'
import { increaseBalance } from '../services/balances'
import { getOrCreateArtMetadata } from '../services/arts'
import { getStylesToken } from './style'

export function handleArtTransfer(event: Transfer): void {
  if (address.isZeroAddress(event.params.from)) {
    //
    // Mint
    //

    let artsContract = BlockArt.bind(event.address)
    let artsToken = getArtsToken(event.address.toHexString())

    let metadataUri = artsContract.tokenURI(event.params.tokenId)
    let styleId = artsContract.tokenToStyle(event.params.tokenId)
    let style = Style.load(styleId.toString())!
    let creator = getOrRegisterAccount(event.params.to)

    let stylesToken = getStylesToken(style.token)
    let stylesContract = BlockStyle.bind(stylesToken.address as Address)

    // Mint art NFT
    let art = new Art(event.params.tokenId.toString())
    art.blockNumber = artsContract.tokenToBlock(event.params.tokenId)
    art.style = style.id
    art.token = artsToken.id
    art.tokenId = event.params.tokenId
    art.creator = creator.id
    art.owner = creator.id
    art.value = decimal.fromBigInt(event.transaction.value)
    art.mintedAt = event.block.timestamp
    art.mintedAtBlock = event.block.number
    art.mintedAtTransaction = event.transaction.hash

    // Process art metadata
    let metadata = getOrCreateArtMetadata(metadataUri)
    metadata.art = art.id
    metadata.save()

    art.metadata = metadata.id
    art.save()

    increaseCounter('artCount')

    // Update style metadata from art metadata
    style.name = metadata.styleName
    style.creatorName = metadata.styleCreatorName
    style.save()

    // Save price for current block
    let price = new BlockPrice(art.blockNumber.toString())
    price.blockNumber = art.blockNumber
    price.timestamp = art.createdAt!
    price.value = art.value
    price.save()

    // Track mint fee
    let feeMultiplier = decimal.fromBigInt(stylesContract.getStyleFeeMul(style.tokenId))
    let minFee = decimal.fromBigInt(stylesContract.getStyleFeeMin(style.tokenId))
    let fee = art.value.div(feeMultiplier).times(decimal.ONE_HUNDRED)

    if (fee.lt(minFee)) {
      fee = minFee
    }

    increaseBalance('treasury', art.value.minus(fee))

    // Log art minted
    let mint = new ArtMint(event.transaction.hash.toHexString() + event.logIndex.toString())
    mint.art = art.id
    mint.creator = creator.id
    mint.value = art.value
    mint.fee = fee
    mint.block = event.block.number
    mint.timestamp = event.block.timestamp
    mint.transaction = event.transaction.hash
    mint.save()

    // Update art token supply
    artsToken.supply = integer.increment(artsToken.supply)
    artsToken.save()
  } else {
    //
    // Transfer
    //

    let art = Art.load(event.params.tokenId.toString())

    if (art != null && art.owner == event.params.from.toHexString()) {
      let previousOwner = getOrRegisterAccount(event.params.from)
      let newOwner = getOrRegisterAccount(event.params.to)

      art.owner = newOwner.id
      art.save()

      let transfer = new ArtTransfer(event.transaction.hash.toHexString() + event.logIndex.toString())
      transfer.art = art.id
      transfer.from = previousOwner.id
      transfer.to = newOwner.id
      transfer.block = event.block.number
      transfer.timestamp = event.block.timestamp
      transfer.transaction = event.transaction.hash
      transfer.save()
    }
  }
}

function getArtsToken(address: string): Token {
  let token = Token.load(address)

  if (token == null) {
    let artsContract = BlockArt.bind(Address.fromString(address))

    token = new Token(address)
    token.address = artsContract._address
    token.name = artsContract.name()
    token.symbol = artsContract.symbol()
    token.supply = integer.ZERO
  }

  return token!
}
