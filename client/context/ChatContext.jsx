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

    //Function to subscribe to message from selected users to get message in real time
    const subscribeToMessage = async()=>{
        if(!socket) return;
        socket.on("newMessage",(newMessage)=>{
            console.log("Received newMessage:", newMessage);
            
            // If we have a selected user and this message is from/to them, show it immediately
            if(selectedUser && (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)){
                newMessage.seen = true;
                setMessages((prevMessages)=>[...prevMessages,newMessage])
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                // Update unseen count for other users
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
        if(socket) {
            subscribeToMessage();
        }
        return ()=> unsucbscribeFromMessages();
    },[socket])



    //Function to send message to selected user
    const sendMessage = async(messageData)=>{
        if(!selectedUser) {
            toast.error("Please select a user to send message");
            return;
        }
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData)
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages,data.newMessage])
                // Refresh from server to ensure complete, ordered thread (prevents stale UI until user switches)
                await getMessages(selectedUser._id)
            }else{
                toast.error(data.message)
            }
        }catch(error){
            console.error("Send message error:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to send message")
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