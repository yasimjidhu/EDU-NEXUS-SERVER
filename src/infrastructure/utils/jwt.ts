import jwt from 'jsonwebtoken'

const jwtSecret:string = process.env.JWT_SECRET||'edu-nexus'

const generateToken = (userDetails:{})=>{
    return jwt.sign(userDetails,jwtSecret,{expiresIn:'1h'})
}

const verifyToken = (token:any)=>{
    try{
        const decoded =jwt.verify(token,jwtSecret)
        return decoded
    }catch(err){
        console.log(err)
        return null
    }
}

export {generateToken,verifyToken}