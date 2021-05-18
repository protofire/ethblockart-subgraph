import { Bytes, ipfs, json, JSONValue } from '@graphprotocol/graph-ts'

export class IpfsResource {
  readonly cid: string
  readonly path: string

  private _raw: Bytes

  constructor(uri: string) {
    let pos = uri.indexOf('Qm')
    this.cid = uri.slice(pos, pos + 46)
    this.path = uri.slice(pos + 46)
  }

  get raw(): Bytes {
    if (!this._raw) {
      this._raw = ipfs.cat(this.cid)!
    }

    return this._raw
  }

  toString(): string {
    return 'ipfs://' + this.cid + (this.path ? '/' + this.path : '')
  }

  parse(): JSONValue {
    return json.fromBytes(this.raw!)
  }

  static from(uri: string): IpfsResource {
    return new IpfsResource(uri)
  }
}
