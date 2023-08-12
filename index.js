const core = require('@actions/core');
const github = require('@actions/github');

try {
  const dockerImage = core.getInput('dockerImage');
  const labels = core.getInput('labels');
  const env = core.getInput('env');
  const overlayNetworks = core.getInput('overlayNetworks');
  const externalNetworks = core.getInput('externalNetworks');

  console.log(dockerImage);
  console.log(labels);
  console.log(env);
  console.log(overlayNetworks);
  console.log(externalNetworks);

  core.setOutput('dockerComposeString', 'empty');
  console.log('empty');
} catch (error) {
  core.setFailed(error.message);
}
