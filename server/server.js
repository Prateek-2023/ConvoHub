{/* packages that installed  on terminal
                            bcryptjs - To encrypt the passwords
                            cloudinary - Tp upload the chat images or profiel image on cloud storage
                            cors - allow backend to connect with frontend url
                            dotenv - We can use the environment variables in backend server
                            express - create backend server
                            json web token - Generate tokens to authenticate the users
                            mongoose - connect the prject with mongodb database
                            socket.io - enable real time chat messaging*/}

import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

//Create Express and http server
const app = express();
const server = http.createServer(app)

//initialize socket.io server
export const io = new Server(server,{
    cors:{origin:"*"}
})

//store online users
export const userSocketMap = {}; // stored in form of userid,socketID

//socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User connected",userId);
    if (userId) userSocketMap[userId] = socket.id 

    //emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    socket.on("disconnect",()=>{
        console.log("User disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

//MiddleWare setup
app.use(express.json({limit:"4mb"}));
app.use(cors());

//Routes setup
app.use("/api/status", (req, res)=>res.send("Server is Live."))
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)

//connect to db

await connectDB();
const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=>console.log("Server is running on PORT: "+PORT));
