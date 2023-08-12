const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');

const apiUrl = 'https://dashboard.ludeku.net';

const run = async () => {
  try {
    const stackName = core.getInput('stack');
    const dockerImage = core.getInput('image');
    const deployUrl = core.getInput('deployUrl');
    const port = core.getInput('port');
    const apiKey = core.getInput('apiKey');

    const stackBody = `
      version: '3.3'  
      services:
        app:
          image: ${dockerImage}
          networks:
          - net
          - traefik-public
          logging:
            driver: json-file
          deploy:
            labels:
              traefik.docker.network: traefik-public
              traefik.enable: 'true'
              traefik.http.routers.app.rule: Host(\`${deployUrl}\`)
              traefik.http.routers.app.tls: 'true'
              traefik.http.routers.app.tls.certresolver: leresolver
              traefik.http.services.app.loadbalancer.server.port: '${port || 5000}'
      networks:
        net:
          driver: overlay
        traefik-public:
          external: true
  `;

    const headers = {
      Authorization: `Bearer ${apiKey}`
    };

    // If the stack exists this will 200, otherwise will 400
    const stackExistsResponse = await fetch(
      `${apiUrl}/api/stacks/${stackName}/compose`,
      {
        headers
      }
    );

    // Create stack if it doesn't exist or update if it does
    let endpoint = `${apiUrl}/api/stacks`;

    if (stackExistsResponse.ok) {
      endpoint += `/${stackName}`;
    }

    const body = {
      name: stackName,
      spec: {
        compose: stackBody
      }
    };

    const deployResponse = await fetch(endpoint, {
      method: 'post',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!deployResponse.ok) {
      const deployJSON = await deployResponse.json();
      return core.setFailed(
        `Deploy failed with status ${deployResponse.status
        } and message: ${JSON.stringify(deployJSON)}`
      );
    }

    core.info('Deploy succeeded');
  } catch (error) {
    core.setFailed(error?.message || 'Unknown error');
  }
};

run();
