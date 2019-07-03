const { createHash } = require(`crypto`)
const { basename } = require(`path`)
const { execSync } = require(`child_process`)

const getRepositoryId = () => {
  const gitRepo = getGitRemoteWithGit() || getRepositoryFromNetlifyEnv()
  if (gitRepo) {
    return `git:${hash(gitRepo)}`
  } else {
    const repo = getRepositoryIdFromPath()
    return `pwd:${hash(repo)}`
  }
}

const getRepositoryIdFromPath = () => `pwd:${hash(basename(process.cwd()))}`

const getGitRemoteWithGit = () => {
  try {
    // we may live multiple levels in git repo
    const originBuffer = execSync(
      `git config --local --get remote.origin.url`,
      { timeout: 1000, stdio: `pipe` }
    )
    const repo = String(originBuffer).trim()
    return repo
  } catch (e) {
    // ignore
  }
  return null
}

const getRepositoryFromNetlifyEnv = () => {
  if (process.env.NETLIFY) {
    try {
      const url = process.env.REPOSITORY_URL
      const repoPart = url.split(`@`)[1]
      if (repoPart) {
        return repoPart
      }
    } catch (e) {
      // ignore
    }
  }
  return null
}

const hash = str =>
  createHash(`sha256`)
    .update(str)
    .digest(`hex`)

module.exports = {
  getRepositoryId,
}
