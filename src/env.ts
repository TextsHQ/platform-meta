import { DBType, MigrateStrategy } from './store/helpers'

export const PolarisBDHeaderConfig = {
  ASBD_ID: '129477', // loaded as hard coded value in meta's code, same for both envs
} as const

const EnvOptions = {
  IG: {
    id: 'instagramdotcom',
    domain: 'www.instagram.com',
    // baseURL: 'https://www.instagram.com/',
    initialURL: 'https://www.instagram.com/direct/' as const,
    defaultContactName: 'Instagram User' as const,
    defaultVersionId: 6552526831451374,
    dbType: DBType.IN_MEMORY,
    migrationStrategy: MigrateStrategy.RECREATE_SIMPLE,
    supportsArchive: false,
    isFacebook: false,
    syncManagerEnabled: false,
  },
  FB: {
    id: 'facebookdotcom',
    domain: 'www.facebook.com',
    // baseURL: 'https://www.facebook.com/',
    initialURL: 'https://www.facebook.com/messages/' as const,
    defaultContactName: 'Facebook User' as const,
    defaultVersionId: 6345422228920134, // @TODO: CHECK THIS
    dbType: DBType.IN_MEMORY,
    migrationStrategy: MigrateStrategy.DRIZZLE,
    supportsArchive: true,
    isFacebook: true,
    syncManagerEnabled: false,
  },
  MESSENGER: {
    id: 'messengerdotcom',
    domain: 'www.messenger.com',
    // baseURL: 'https://www.messenger.com/',
    initialURL: 'https://www.messenger.com/' as const,
    defaultContactName: 'Facebook User' as const,
    defaultVersionId: 6345422228920134,
    dbType: DBType.IN_MEMORY,
    migrationStrategy: MigrateStrategy.RECREATE_SIMPLE,
    supportsArchive: true,
    isFacebook: true,
    syncManagerEnabled: false,
  },
  WORK: {
    id: 'workplacedotcom',
    domain: '',
    defaultContactName: '',
    initialURL: '',
    defaultVersionId: 0,
    dbType: DBType.IN_MEMORY,
    migrationStrategy: MigrateStrategy.RECREATE_SIMPLE,
    // migrationStrategy: MigrateStrategy.DRIZZLE,
    supportsArchive: false,
    isFacebook: false,
    syncManagerEnabled: false,
  },
  WORKMETA: {
    id: 'workdotmetadotcom',
    domain: '',
    defaultContactName: '',
    initialURL: '',
    defaultVersionId: 0,
    dbType: DBType.PERSISTENT,
    migrationStrategy: MigrateStrategy.RECREATE_SIMPLE,
    // migrationStrategy: MigrateStrategy.DRIZZLE,
    supportsArchive: false,
    isFacebook: false,
    syncManagerEnabled: false,
  },
} as const

export type EnvKey = keyof typeof EnvOptions
export type EnvOptionsValue = typeof EnvOptions[EnvKey]

export const THREAD_PAGE_SIZE = 15

export default EnvOptions
