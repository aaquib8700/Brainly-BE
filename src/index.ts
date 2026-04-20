import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import z, { hash } from "zod";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "./config.js";
import { userMiddlware } from "./middleware.js";
import { random } from "./utils.js";
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup", async (req, res) => {
  const requiredBody = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(8).max(15),
  });

  const parsedData = requiredBody.safeParse(req.body);

  if (!parsedData.success) {
    res.json({
      message: "Incorrect Format",
      error: parsedData.error,
    });
  }

  const username = req.body.username;
  const password = req.body.password;

  const hashedPassword = await bcrypt.hash(password, 5);
  console.log("hashedpassword", hashedPassword);

  try {
    await UserModel.create({
      username: username,
      password: hashedPassword,
    });

    res.json({
      message: "You are signed up",
    });
  } catch (error) {
    res.status(411).json({
      message: "Username already exists",
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
    const username=req.body.username;
    const password=req.body.password;

    console.log("Signin attempt for username:", username);
    console.log("Password received:", password ? "yes (length: " + password.length + ")" : "no");

    const existingUser=await UserModel.findOne({
        username,
    })

    console.log("User found:", existingUser ? "yes" : "no");

    if(!existingUser){
        return res.status(404).json({
            message:"User does not exist",
        })

    }

    console.log("Stored password hash:", (existingUser as any).password);
    const passwordMatch= await bcrypt.compare(password,(existingUser as any).password);
    console.log("Password match:", passwordMatch);

    if(passwordMatch){
        const token=jwt.sign({
            id:(existingUser as any)._id
        },JWT_SECRET)

        res.json({
            token
        })
    }
    else{
        return res.status(403).json({
            message:"Incorrect Credentials"
        })
    }
});

app.post("/api/v1/content",userMiddlware,async (req, res) => {
    const link=req.body.link;
    const type=req.body.type;

    // @ts-ignore
    await ContentModel.create({
        link,
        type,
        title:req.body.title,
        // @ts-ignore
        userId:req.userId,
        tags:[]
    })

    return res.json({
      message:"Content Added"
    })
});

app.get("/api/v1/content",userMiddlware, async (req, res) => {
  // @ts-ignore
  const userId=req.userId;
  const Content= await ContentModel.find({
    userId:userId,
  }).populate("userId","username")

  res.json({
    Content,
  });

});

app.delete("/api/v1/content",userMiddlware,async (req, res) => {
  const contentId=req.body.contentId;

  try {
      await ContentModel.deleteOne({
    _id:contentId,
    // @ts-ignore
    userId:req.userId
  })

  res.json({
    message:"Content deleted"
  })
  } catch (error) {
    res.status(411).json({
      message:"Content doest exists" 
    })
  }
});

app.post("/api/v1/brain/share",userMiddlware,async (req, res) => {
  const share=req.body.share;

  if(share){

    const existingLink=await LinkModel.findOne({
      // @ts-ignore
      userId:req.userId,
    })

    if(existingLink){
      res.json({
        hash:existingLink.hash,
      })
      return;
    }
    const hash=random(10);
    await LinkModel.create({
      // @ts-ignore
      userId:req.userId,
      hash:hash
    })

    res.json({
       message:hash
    })
  }
  else{
    await LinkModel.deleteOne({
      // @ts-ignore
      userId:req.userId,
    })

  res.json({
    message:"Removed link"
  })

  }


});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash=req.params.shareLink;

  const link=await LinkModel.findOne({
    hash,
  })

  if(!link){
    res.status(411).json({
      messgae:"Sorry incorrect input"
    })
    return;
  }
  const content=await ContentModel.find({
      userId:link.userId,
   })

   const user=await UserModel.findOne({
    _id:link.userId
   })

   if(!user){
    res.status(411).json({
      message:"user not found,error should ideally not happen"
    })
    return;
   }

   res.json({
    username:user.username,
    content:content
   })
    
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
 