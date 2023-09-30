import PlatformAPI from '../api'

export default class PlatformFacebook extends PlatformAPI {
  constructor(readonly accountID: string) {
    super(accountID, 'FB')
  }
}
