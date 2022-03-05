import React, { useState, useEffect } from 'react'
// import QRCode from 'qrcode.react'
import type { PlatformAPI, LoginCreds } from '@textshq/platform-sdk'

export const Auth: React.FC<{
  api: PlatformAPI
  login: (creds: LoginCreds) => void
}> = ({ api, login }) => <>Not implemented</>

export default Auth
