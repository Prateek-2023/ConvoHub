import { AuthContext } from "./AuthContext";
import { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";



export const ChatContext = createContext();
export const ChatProvider = ({children})=>{

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessage, setUnseenMessage] = useState({})

    const {socket,axios} = useContext(AuthContext)

    //Function ot get all users for sidebar
    const getUsers = async()=>{
        try {
            const { data } = await axios.get("/api/messages/users")
            if(data.success){
                setUsers(data.users)
                setUnseenMessage(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)   
        }
    }

    //Function to get all messages for selected user
    const getMessages = async(userId)=>{
        try {
            const { data } = await axios.get(`/api/messages/${userId}`)
            if(data.success){
                setMessages(data.messages)
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    //Function to subscribe to message fro selected users to get message i n real time
    const subscribeToMessage = async(userId)=>{
        if(!socket) return;
        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=>[...prevMessages,newMessage])
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessage((prevUnseenMessage)=>({
                    ...prevUnseenMessage,[newMessage.senderId]:prevUnseenMessage[newMessage.senderId] ? prevUnseenMessage[newMessage.senderId]+1:1 
                }))
            }
        })
    }


    //Function to unsucbscribe from messages
    const unsucbscribeFromMessages = ()=>{
        if(socket) socket.off("newMessage");
    }
    useEffect(()=>{
        subscribeToMessage();
        return ()=> unsucbscribeFromMessages();
    },[socket,selectedUser])



    //Function to send message to selected user
    const sendMessage = async(messageData)=>{
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData)
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages,data.newMessage])
            }else{
                toast.error(data.message)
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    const value = {
        messages,users,selectedUser,getUsers,getMessages,sendMessage,setSelectedUser,unseenMessage,setUnseenMessage  
    }
    return(
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}