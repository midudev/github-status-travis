#!/usr/bin/env node

const core = require('./core')
const program = require('commander')

program
  .version(require('./package.json').version)
  .option('-a --api [url]', 'GitHub API, in case you want to point to your enterprise url', 'https://api.github.com')
  .option('-c, --context [text]', 'A string label to differentiate this status from the status of other systems.')
  .option('-d, --description [text]', 'A short description of the status.')
  .option('-s, --state [state]', 'The state of the status.', /^(error|failure|pending|success)$/i, 'success')
  .option('-u, --target_url [url]', 'The target URL to associate with this status. This URL will be linked from the GitHub UI to allow users to easily see the source of the status.', '')
  .parse(process.argv)

core({
  baseUrl: program.api,
  ...program
})