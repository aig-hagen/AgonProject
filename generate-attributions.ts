#!/usr/bin/env node

import { execSync } from 'child_process'
import { readdir, readFile, writeFile } from 'fs/promises'
import checker, { type InitOpts, type ModuleInfo, type ModuleInfos } from 'license-checker'

import { type Attribution } from './src/modules/common/attributions/types.ts'

const TWEETY_VERSION = getVersionFromGit('third-party/TweetyProjectTeam/TweetyProject')
const XAI_CA_VERSION = await getVersionFromDirName('third-party/xai-ca/xray')

const whitelistedLicenses = [
  'GPL-3.0',
  'MIT',
  'Apache-2.0',
  'ISC',
  'Python-2.0',
  'CC-BY-4.0',
  'Unlicense',
  'BSD-3-Clause',
  'BSD-2-Clause',
  'BlueOak-1.0.0',
  'MPL-2.0',
  'CC0-1.0',
  'CC-BY-3.0',
].join(';')
const options: InitOpts = {
  start: '.',
  excludePrivatePackages: true,
  onlyAllow: whitelistedLicenses,
}
checker.init(options, (err, packages) => {
  if (err) {
    throw err
  } else {
    writeAttributionsJson(packages)
  }
})
writeCtanPackagesAttributionsJson()

async function writeAttributionsJson(packages: ModuleInfos) {
  const attributions = [
    ...(await attributionsForNonNpmPackages()),
    ...(await attributionsForNpmPackages(packages)),
  ]
  await writeFile('third-party/attribution.json', JSON.stringify(attributions, null, 2), 'utf8')
}

async function attributionsForNonNpmPackages(): Promise<Attribution[]> {
  return [
    {
      name: 'TweetyProject',
      version: TWEETY_VERSION,
      license: 'LGPL-3.0-only',
      repository: 'https://github.com/TweetyProjectTeam/TweetyProject',
      publisher: 'Matthias Thimm and other contributors',
      licenseText: await readFile(
        'third-party/TweetyProjectTeam/TweetyProject/lgpl_license.txt',
        'utf8',
      ),
    },
    {
      name: 'Argumentation Framework eXplanation, Reasoning, and AnalYsis',
      version: XAI_CA_VERSION,
      license: 'MIT',
      repository: 'https://github.com/xai-ca/xray',
      publisher: 'University of Illinois Urbana-Champaign',
      licenseText: await readFile(`third-party/xai-ca/xray/${XAI_CA_VERSION}/LICENSE`, 'utf8'),
    },
  ]
}

function getVersionFromGit(base: string) {
  return execSync('git describe --always --dirty', {
    cwd: base,
    encoding: 'utf8',
  }).trim()
}

async function getVersionFromDirName(base: string) {
  const entries = await readdir(base, { withFileTypes: true })
  if (entries.length != 1 || !entries[0].isDirectory()) {
    throw new Error(`Unexpected file system entries ${JSON.stringify(entries)}`)
  }
  return entries[0].name
}

async function attributionsForNpmPackages(packages: ModuleInfos): Promise<Attribution[]> {
  const attributions = []

  for (const [packageName, info] of Object.entries(packages)) {
    const attribution = await attributionsForNpmPackage(packageName, info)
    attributions.push(attribution)
  }

  return attributions
}

async function attributionsForNpmPackage(
  packageName: string,
  info: ModuleInfo,
): Promise<Attribution> {
  let scope
  let name
  let version
  const fullNameParts = packageName.split('@')
  // e.g. @acemir/cssom@0.9.29
  if (fullNameParts.length === 3 && fullNameParts[0] == '') {
    const nameParts = fullNameParts[1].split('/')
    if (nameParts.length != 2) {
      throw new Error(`Unexpected package name: ${packageName}`)
    }
    scope = nameParts[0]
    name = nameParts[1]
    version = fullNameParts[2]
    // e.g. dom-serializer@2.0.0
  } else if (fullNameParts.length === 2) {
    name = fullNameParts[0]
    version = fullNameParts[1]
  } else {
    throw new Error(`Unexpected full package name: ${packageName}`)
  }

  if (info.licenses === undefined || Array.isArray(info.licenses)) {
    throw new Error(`Invalid license in ${JSON.stringify(info)} for ${packageName}`)
  }

  const repository = getRepository(packageName, info)

  let licenseText
  if (
    info.licenseFile !== undefined &&
    (info.licenseFile.endsWith('LICENCE') ||
      info.licenseFile.endsWith('LICENCE.md') ||
      info.licenseFile.endsWith('LICENSE') ||
      info.licenseFile.endsWith('LICENSE.md') ||
      info.licenseFile.endsWith('LICENSE.txt') ||
      info.licenseFile.endsWith('LICENSE.BSD') ||
      info.licenseFile.endsWith('LICENSE-MIT') ||
      info.licenseFile.endsWith('LICENSE-MIT.txt') ||
      info.licenseFile.endsWith('license') ||
      info.licenseFile.endsWith('license.md') ||
      info.licenseFile.endsWith('license.txt') ||
      info.licenseFile.endsWith('license-cc0') ||
      info.licenseFile.endsWith('node_modules/spdx-exceptions/README.md'))
  ) {
    licenseText = await readFile(info.licenseFile, 'utf-8')
  } else {
    licenseText = await fetchLicense(packageName, version, info)
  }

  return {
    scope: scope,
    name: name,
    version: version,
    license: info.licenses,
    repository: repository,
    publisher: info.publisher,
    licenseText: licenseText,
  }
}

function getRepository(packageName: string, info: ModuleInfo): string {
  if (info.repository !== undefined) {
    return info.repository
  }

  if (packageName.startsWith('rettime@')) {
    return 'https://github.com/kettanaito/rettime'
  }

  throw new Error(`No repository for ${packageName} with ${JSON.stringify(info)}`)
}

async function fetchLicense(
  packageName: string,
  version: string,
  info: ModuleInfo,
): Promise<string | null> {
  if (info.repository === undefined || !info.repository.startsWith('https://github.com')) {
    throw new Error('Can only fetch licenses from GitHub.')
  }
  let url
  if (packageName.startsWith('@drgrice1/tikzjax@1.0.0-beta24')) {
    return null
  } else if (packageName.startsWith('@esbuild/linux-')) {
    url = `https://raw.githubusercontent.com/evanw/esbuild/refs/tags/v${version}/LICENSE.md`
  } else if (packageName.startsWith('@oxlint/binding-linux-')) {
    url = `https://raw.githubusercontent.com/oxc-project/oxc/refs/tags/oxlint_v${version}/LICENSE`
  } else if (packageName.startsWith('@polka/url@')) {
    url = `https://raw.githubusercontent.com/lukeed/polka/refs/tags/v${version}/license`
  } else if (packageName.startsWith('@rollup/rollup-linux-')) {
    url = `https://raw.githubusercontent.com/rollup/rollup/refs/tags/v${version}/LICENSE.md`
  } else if (packageName.startsWith('@vue/devtools-api@')) {
    url = `https://raw.githubusercontent.com/vuejs/devtools-v6/refs/tags/v${version}/LICENSE`
  } else if (packageName === 'boolbase@1.0.0') {
    url = `https://raw.githubusercontent.com/fb55/boolbase/refs/heads/master/LICENSE`
  } else if (packageName === 'eastasianwidth@0.2.0') {
    url = `https://raw.githubusercontent.com/komagata/eastasianwidth/refs/heads/master/MIT-LICENSE.txt`
  } else if (packageName === 'eslint-plugin-no-relative-import-paths@1.6.1') {
    return null
  } else if (packageName === 'esrecurse@4.3.0') {
    url = `https://raw.githubusercontent.com/estools/esrecurse/refs/heads/master/LICENSE.md`
  } else if (packageName === 'html-parsed-element@0.4.1') {
    return null
  } else if (packageName.startsWith('imurmurhash@0.1.4')) {
    url = `https://raw.githubusercontent.com/jensyt/imurmurhash-js/refs/tags/${version}/LICENSE`
  } else if (packageName === 'keyv@4.5.4') {
    url = 'https://raw.githubusercontent.com/jaredwray/keyv/refs/heads/main/LICENSE'
  } else if (packageName === 'natural-compare@1.4.0') {
    url = `https://lauri.rooden.ee/mit-license.txt`
  } else if (packageName.startsWith('saxes@')) {
    url = `https://raw.githubusercontent.com/lddubeau/saxes/refs/tags/v${version}/LICENSE`
  } else if (packageName.startsWith('sirv@3')) {
    url = `https://raw.githubusercontent.com/lukeed/sirv/refs/tags/v${version}/license`
  } else if (packageName === 'spdx-license-ids@3.0.23') {
    url = 'https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt'
  } else if (packageName === 'stackback@0.0.2') {
    return null
  } else if (packageName === 'svg-path-reverse@1.7.0') {
    return 'This code is in the public domain, except in jurisdictions that do not recognise the public domain, where this code is MIT licensed.'
  } else {
    throw new Error(`No license file for ${packageName} with ${JSON.stringify(info)}`)
  }

  return await fetchTextOk(url)
}

async function writeCtanPackagesAttributionsJson() {
  // Used in @drgrice1/tikzjax
  // See https://github.com/drgrice1/tikzjax/blob/main/tex_files.json
  const packages: {
    name: string
    version?: string
  }[] = [
    'amsbsy',
    'amsfonts',
    'amsmath',
    'amsopn',
    'amstext',
    'array',
    'etoolbox',
    'expl3',
    'hf-tikz',
    'ifthen',
    'l3backend',
    'pgf',
    'pgfplots',
    'tikz-3dplot',
    'tikz-bbox',
    'tikz-cd',
    'xparse',
  ].map((name) => ({
    name: name,
    version: undefined,
  }))
  // Used in @drgrice1/tikzjax
  // See https://github.com/drgrice1/tikzjax/blob/main/installFonts.mjs
  // https://ctan.org/tex-archive/fonts/cm/ps-type1/bakoma
  packages.push({
    name: 'bakoma-fonts',
    version: undefined,
  })
  // Additional added by us and not included by default in @drgrice1/tikzjax
  const additionalPackages = await readdir('third-party/ctan.org/pkg')
  for (const additionalPackage of additionalPackages) {
    packages.push({
      name: additionalPackage,
      version: await getVersionFromDirName('third-party/ctan.org/pkg/' + additionalPackage),
    })
  }
  packages.sort((a, b) => a.name.localeCompare(b.name))
  const attributions = []
  for (const pkg of packages) {
    const attribution = await mapPackageToAttribution(pkg)
    attributions.push(attribution)
  }
  await writeFile(
    'third-party/ctan-attribution.json',
    JSON.stringify(attributions, null, 2),
    'utf8',
  )
}

async function mapPackageToAttribution(pkg: { name: string; version?: string }): Attribution {
  const response = await fetchJsonOk(`https://www.ctan.org/json/2.0/pkg/${pkg.name}`)
  const [license, licenseText] = await getLicense(response)
  const publisher = await getPublisher(response)
  return {
    name: pkg.name,
    version: pkg.version,
    license: license,
    licenseText: licenseText,
    publisher: publisher,
    repository: `https://ctan.org/pkg/${pkg.name}`,
  }
}

async function getPublisher(responseObject) {
  if (responseObject.copyright.length !== 0) {
    return responseObject.copyright.map((copyright) => `${copyright.year} ${copyright.owner}`).join('; ')
  }
  if (responseObject.authors.length !== 0) {
    const authors = []
    for (const { id: authorId} of responseObject.authors) {
      const authorData = await fetchJsonOk(`https://www.ctan.org/json/2.0/author/${authorId}`)
      const authorName = [authorData.givenname, authorData.von, authorData.familyname, authorData.junior].filter(part => part !== "").join(' ')
      authors.push(authorName)
    }
    return enumarate(authors)
  }
  throw new Error('Could not determin authors: ' + responseObject)
}

async function getLicense(responseObject) {
  const license = responseObject.license
  let spdxKey
  if (license === 'lppl1.3') {
    spdxKey = 'LPPL-1.3c'
  } else if (license === 'lppl1.3c') {
    spdxKey = 'LPPL-1.3c'
  } else if (license === 'ofl') {
    spdxKey = 'OFL-1.1'
  } else if (license === 'gpl3+') {
    spdxKey = 'GPL-3.0-or-later'
  } else if (license === 'other-free' && responseObject.id === 'bakoma-fonts') {
    const licenseText = await fetchTextOk(
      'https://mirrors.ctan.org/fonts/cm/ps-type1/bakoma/LICENCE',
    )
    return ['BaKoMa Fonts Licence', licenseText]
  } else if (Array.isArray(license) && license.includes('lppl1.3c')) {
    spdxKey = 'LPPL-1.3c'
  } else {
    throw new Error('Unknown license: ' + license)
  }
  const licenseText = await getLicenseText(spdxKey)
  return [spdxKey, licenseText]
}

const bySpdxKeyLicenseText = {}

async function getLicenseText(spdxKey) {
  let licenseText = bySpdxKeyLicenseText[spdxKey]
  if (licenseText == undefined) {
    const response = await fetchJsonOk(`https://spdx.org/licenses/${spdxKey}.json`)
    licenseText = response.licenseText
    bySpdxKeyLicenseText[spdxKey] = licenseText
  }
  return licenseText
}

async function fetchTextOk(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw Error('Could not fetch ' + url + ': ' + response.status)
  }
  return await response.text()
}

async function fetchJsonOk(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw Error('Could not fetch ' + url + ': ' + response.status)
  }
  return await response.json()
}


function enumarate(strings: string[]) {
  if (strings.length === 0) {
    return ''
  }
  if (strings.length === 1) {
    return strings[0]
  }
  return strings.slice(0, -1).join(', ') + ' and ' + strings[strings.length - 1]
}
