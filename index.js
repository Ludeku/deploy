const core = require('@actions/core');
const github = require('@actions/github');

try {
  const dockerImage = core.getInput('image');
  const environment = core.getInput('environment');
  const deployUrl = core.getInput('deployUrl');
  const port = core.getInput('port');

  const stack = `
    version: '3.3'  
    services:
      app:
        image: ${dockerImage}
        environment:
          ${environment}
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

  core.setOutput('dockerComposeString', stack);
  console.log(stack);
} catch (error) {
  core.setFailed(error.message);
}
