import fs from 'fs/promises'

async function main() {
  const resp = await fs.readFile('./direct.html', 'utf8')
  const clientId = resp.slice(resp.indexOf('{"clientID":')).split('"')[3];
  const dtsg = resp.slice(resp.indexOf("DTSGInitialData")).split('"')[4];
  const fbid = resp.match(/"IG_USER_EIMU":"([^"]+)"/)?.[1]; // fbid
  const sharedData = htmlString.match(/"XIGSharedData",\[\],({.*?})/s)[1];
  // @TODO: this is disgusting
  const config = JSON.parse(`${sharedData.split('"viewer\\":')[1].split(',\\"badge_count')[0]}}`.replace(/\\\"/g, '"'))
  console.log({
    clientId,
    dtsg,
    fbid,
    config,
  })
}

main()
