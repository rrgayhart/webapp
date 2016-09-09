
const API_VERSION = 'v2'
const basePath = () => `${ENV.MESSAGES_DOMAIN}/api`

export default function startConversation() {
  return {
    path: `${basePath()}/${API_VERSION}/conversations`,
  }
}

