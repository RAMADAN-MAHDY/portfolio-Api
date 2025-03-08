import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: Number,
    min: 11
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const ContactSchema = mongoose.model('User', contactSchema);

export default ContactSchema;