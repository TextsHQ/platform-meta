import PlatformAPI from '../api'

export default class PlatformInstagram extends PlatformAPI {
  constructor(readonly accountID: string) {
    super(accountID, 'FB')
  }
}
