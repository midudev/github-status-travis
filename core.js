function extractParamsFromEnv () {
  const {env} = process
  const eventType = env.TRAVIS_EVENT_TYPE
  const repoSlug = env.TRAVIS_REPO_SLUG
  const [owner, repo] = repoSlug.split('/')

  return {
    sha: getCommitShaFromTravis(eventType),
    eventType,
    repo,
    owner
  }
}

function getCommitShaFromTravis (eventType) {
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

function initGitHubConnection ({ api }) {
  const octokit = require('@octokit/rest')({
    baseUrl: api,
    timeout: 0,
    headers: {
      accept: 'application/vnd.github.v3+json',
      'user-agent': 'octokit/rest.js v1.2.3'
    }
  })

  octokit.authenticate({
    type: 'oauth',
    token: process.env.GITHUB_TOKEN
  })

  return octokit
}

function updateGitHubStatus ({api, context, description, state, target_url}) {
  const git = initGitHubConnection({api})

  git.repos.createStatus({
    ...extractParamsFromEnv(),
    context,
    description,
    state,
    target_url
  })
  .then(() => {
    console.log('Sent status correctly')
    process.exit(0)
  })
  .catch(() => {
    console.log('Error sending GitHub Status')
    process.exit(1)
  })
}

module.exports = updateGitHubStatus
