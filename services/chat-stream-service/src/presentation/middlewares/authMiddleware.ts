import jwt,{JwtPayload} from 'jsonwebtoken'

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || ''

export function verifyAccessToken(token: string|undefined): JwtPayload | null {
    try {
      if(token){
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
      }else{
        return null
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      }
      throw new Error('Invalid access token');
    }
}