const EnvOptions = {
  IG: {
    id: 'instagramdotcom',
    domain: 'www.instagram.com',
    // baseURL: 'https://www.instagram.com/',
    initialURL: 'https://www.instagram.com/direct/' as const,
    defaultContactName: 'Instagram User' as const,
    defaultVersionId: 6552526831451374,
  },
  FB: {
    id: 'facebookdotcom',
    domain: 'www.facebook.com',
    // baseURL: 'https://www.facebook.com/',
    initialURL: 'https://www.facebook.com/messages/' as const,
    defaultContactName: 'Facebook User' as const,
    defaultVersionId: 6552526831451374, // @TODO: CHANGE THIS
  },
  MESSENGER: {
    id: 'messengerdotcom',
    domain: 'www.messenger.com',
    // baseURL: 'https://www.messenger.com/',
    initialURL: 'https://www.messenger.com/' as const,
    defaultContactName: 'Facebook User' as const,
    defaultVersionId: 6552526831451374, // @TODO: CHANGE THIS
  },
  WORK: {
    id: 'workplacedotcom',
    domain: '',
    defaultContactName: '',
    initialURL: '',
    defaultVersionId: 0,
  },
  WORKMETA: {
    id: 'workdotmetadotcom',
    domain: '',
    defaultContactName: '',
    initialURL: '',
    defaultVersionId: 0,
  },
} as const

export type EnvKey = keyof typeof EnvOptions
export type EnvOptionsValue = typeof EnvOptions[EnvKey]

export default EnvOptions
