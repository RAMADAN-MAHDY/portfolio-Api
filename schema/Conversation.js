
import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // زائر + أدمن
    createdAt: { type: Date, default: Date.now },
  });
  
   const Conversation_Schema = mongoose.model("Conversation", ConversationSchema);
   
   export default Conversation_Schema;