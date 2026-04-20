import type { NextFunction,Request,Response } from "express";
import jwt  from "jsonwebtoken";


export const userMiddlware=(req:Request,res:Response,next:NextFunction)=>{
    const header=req.headers["authorization"];
    const decoded=jwt.verify(header as string,process.env.JWT_SECRET as string)

    if(decoded){
        // @ts-ignore
        req.userId=decoded.id;
        next();
    }
    else{
        res.status(403).json({
            message:"You are not logged in"
        })
    }

}