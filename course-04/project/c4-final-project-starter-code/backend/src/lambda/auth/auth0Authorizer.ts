import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const jwksUrl = 'https://fsnd-cmaston.us.auth0.com/.well-known/jwks.json'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJT4nqAGkl+2gKMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWZzbmQtY21hc3Rvbi51cy5hdXRoMC5jb20wHhcNMjEwNTEwMjEwNjM3WhcN
MzUwMTE3MjEwNjM3WjAkMSIwIAYDVQQDExlmc25kLWNtYXN0b24udXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtB8yeusfYnl7aUfj
QvW+onFKtrjdjiTlWnupFeZiSaYcBhvC2WdW6YdSzKjmyYsuGMjUGnHoU3b861id
nTIP/4TC3hfN4dM9BvYWwgnO5ogjgkQqgP48uYNrSGxVUGNoTwx6dXJMAN0Xc9Bc
ZEicKzKUKYoqo0R1dgrSbkU/6d3g3dgsdTmTyp51EbEBgpw/aFpGuFguJA5txhEQ
LxFsPboZTAld9rWazbUSY2aD0AgPaAmRpXP6nzqnv+rA8yi/ahLSOnNcGC23Lp7r
RhHNw/PgulTVWrWGnRBPLBRwI4h3la8l9uYJ7jsnjOB2k80wj8VDJCHlr4cYoz4n
hO0AfQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ9CmxfAyEP
NEcYJZpIeoa5IrNgBDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ABkcZ+5TwQVIqBvS6oBByHbIsfPLHQQ6HlK5pMWDmxjAUCugwcXCwUeYZihHDAtD
X/lWjYociyHfRKtUhILh6A/QKbvGXd4Quwn+d/Xp6uypumkVGbqBWSubVW+ITiZu
pm9vhMIUrK5Dq6C1h0GZnIPcp4CZ9iKr6za/IkHuUhprQqCFISlTqco4hBvcMzGo
sWroWmyR8B8HY6MTOlRu7V5XLksiwgAmkFq4oIyPk67hTach7Y0+DKBD6ouOAhrn
yL34BNai8Ne3RZw1DO02anPa/wPgX6f3u3XDt77fx3obl9WVwB9Lq8pZcKZcYSbV
EMMcYkAVA8l9SAPCwW3ioco=
-----END CERTIFICATE-----
`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')
  
    return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
