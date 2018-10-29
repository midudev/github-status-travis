function initGitHubStatus({baseUrl = 'https://api.github.com'}) {
  const octokit = require('@octokit/rest')({
    baseUrl,
    timeout: 0, // 0 means no request timeout
    headers: {
      accept: 'application/vnd.github.v3+json',
      'user-agent': 'octokit/rest.js v1.2.3' // v1.2.3 will be current version
    }
  })

  return octokit.authenticate({
    type: 'oauth',
    token: process.env.GITHUB_TOKEN
  })
}

function getCommitSha (eventType) {
  if (eventType === 'push') {
    return process.env.TRAVIS_COMMIT
  } else if (eventType === 'pull_request') {
    const travisCommitRange = process.env.TRAVIS_COMMIT_RANGE
    const parsed = travisCommitRange.split('...')

    return parsed.length === 1 ? travisCommitRange : parsed[1]
  }

  console.error("event type '%s' not supported", eventType)
  return null
}

function extractParamsFromEnv () {
  const {env} = process.env
  const eventType = env.TRAVIS_EVENT_TYPE
  const repoSlug = env.TRAVIS_REPO_SLUG
  const [owner, repo] = repoSlug.split('/')

  return {
    sha: getCommitSha(eventType),
    eventType,
    repo,
    owner
  }
}

function extractParamsFromArgs () {
  return require('args-parser')(process.argv)
}

initGitHubStatus({ baseUrl })
octokit.repos
  .createStatus({
    ...extractParamsFromEnv(),
    ...extractParamsFromArgs()
  })
  .then(() => {
    console.log('Sent status correctly')
    process.exit(0)
  })
  .catch(() => {
    console.log('Error sending GitHub Status')
    process.exit(1)
  })
