import PlatformAPI from '../api'

export default class PlatformMessenger extends PlatformAPI {
  constructor(readonly accountID: string) {
    super(accountID, 'MESSENGER')
  }
}
