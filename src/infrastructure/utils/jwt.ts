import jwt from 'jsonwebtoken'

const jwtSecret:string = process.env.JWT_SECRET||'secret'

const generateToken = (userDetails:{})=>{
    return jwt.sign(userDetails,jwtSecret,{expiresIn:'1h'})
}

const verifyToken = (token:any)=>{
    try{
        const decoded =jwt.verify(token,jwtSecret)
        console.log('this is the decoded token ',decoded)
        return decoded
    }catch(err){
        console.log(err)
        return null
    }
}

export {generateToken,verifyToken}