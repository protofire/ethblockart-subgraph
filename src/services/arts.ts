import { Address, JSONValue, JSONValueKind, TypedMap } from '@graphprotocol/graph-ts'

import { ArtAttribute, ArtMetadata, ArtSetting } from '../../generated/schema'

import { IpfsResource } from '../utils/ipfs'

export function getOrCreateArtMetadata(uri: string): ArtMetadata {
  let metadataUrl = IpfsResource.from(uri)

  let metadata = ArtMetadata.load(metadataUrl.toString())

  if (metadata == null) {
    let data = metadataUrl.parse().toObject()

    metadata = new ArtMetadata(metadataUrl.toString())
    metadata.blockNumber = getOrNull(data, 'created_at')!.toBigInt()
    metadata.createdAt = getOrNull(data, 'created_at')!.toBigInt()
    metadata.creatorAddress = Address.fromString(getOrNull(data, 'creator_addr')!.toString())
    metadata.description = getOrNull(data, 'description')!.toString()
    metadata.externalUrl = getOrNull(data, 'external_url')!.toString()
    metadata.name = getOrNull(data, 'name')!.toString()
    metadata.styleId = getOrNull(data, 'style_id')!.toBigInt()
    metadata.styleName = getOrNull(data, 'style_name')!.toString()
    metadata.styleCreatorName = getOrNull(data, 'style_creator_name')!.toString()

    if (metadata.isSet('image')) {
      let image = getOrNull(data, 'image')!.toString()
      metadata.image = IpfsResource.from(image).toString()
    }

    if (data.isSet('attributes')) {
      let attributes = getOrNull(data, 'attributes')!.toArray()

      for (let index = 0, length = attributes.length; index < length; ++index) {
        let data = attributes[index].toObject()
        let displayType = data.get('display_type')
        let maxValue = data.get('max_value')
        let traitType = data.get('trait_type')
        let value = data.get('value')

        let attribute = new ArtAttribute(metadata.id + '-' + index.toString())
        attribute.metadata = metadata.id
        attribute.index = index
        attribute.displayType = displayType.isNull() ? null : displayType.toString()
        attribute.traitType = traitType.isNull() ? null : traitType.toString()

        if (maxValue.kind == JSONValueKind.NUMBER) {
          let num = maxValue.toF64()
          attribute.maxValue = num.toString()
        } else if (maxValue.kind == JSONValueKind.STRING) {
          attribute.maxValue = value.toString()
        }

        if (value.kind == JSONValueKind.NUMBER) {
          let num = value.toF64()
          attribute.value = num.toString()
        } else if (value.kind == JSONValueKind.STRING) {
          attribute.value = value.toString()
        } else if (value.kind == JSONValueKind.OBJECT) {
          let current = value.toObject().get('current')

          if (current.kind == JSONValueKind.NUMBER) {
            let num = current.toF64()
            attribute.value = num.toString()
          } else if (current.kind == JSONValueKind.STRING) {
            attribute.value = current.toString()
          }
        }

        attribute.save()
      }
    }

    if (metadata.isSet('settings')) {
      let settings = getOrNull(data, 'settings')!.toObject()
      let entries = settings.entries

      for (let index = 0, length = entries.length; index < length; ++index) {
        let data = entries[index]
        let key = data.key
        let value = data.value

        let setting = new ArtSetting(metadata.id + '-' + data.key)
        setting.metadata = metadata.id
        setting.key = key

        if (value.kind == JSONValueKind.NUMBER) {
          let num = value.toF64()
          setting.value = num.toString()
        } else if (value.kind == JSONValueKind.STRING) {
          setting.value = value.toString()
        }

        setting.save()
      }
    }
  }

  return metadata!
}

function getOrNull(obj: TypedMap<string, JSONValue>, key: string): JSONValue | null {
  if (obj.isSet(key)) {
    let value = obj.get(key)

    if (!value.isNull()) {
      return value
    }
  }

  return null
}
