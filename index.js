import MongoStore from "connect-mongo";
import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import ContactRouter from './router/ContactRouter.js';
import ContactRouterAdmin from './router/ContactRouterAdmin.js';
import getMessage from './router/getMessage.js'; 
import getConversations from './router/getConversations.js';
import session from 'express-session';
import Dotenv from 'dotenv';
import chatRouter from './router/chat.js';
import getMessageAdmin from './router/getMessageToAdmin.js';
import subscription from './router/save-subscription.js';
import unsubscription from './router/unsubscribe.js';
import sendNotificationToAll from './webpush/sendNotificationToAll.js';
Dotenv.config();


const app = express();

const port = 4000;

//Purpose: To allow the frontend to access the backend
const corsOptions = {
    origin: 'amadan-three.vercel.app',
    optionsSuccessStatus: 200,
    credentials: true
  }
  
app.use(cors(corsOptions));
connectDB();
const uri = process.env.DB_KEY;

app.use(express.json());


app.use(session({
    secret: process.env.session_secret_key,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: uri,
        ttl: 14 * 24 * 60 * 60 // 14 يوم
    }),
    cookie: { secure: false } // في الإنتاج خليها `true` لو عندك HTTPS
}));


// Purpose: To handle the routes for the contact form
app.use('/contact', ContactRouter);
app.use('/admin-reply', ContactRouterAdmin);
app.use('/message', getMessage);
app.use('/getMessageAdmin', getMessageAdmin);
app.use("/conversations", getConversations);
app.use('/chat', chatRouter);
app.use('/unsubscription', unsubscription);
app.use('/subscription', subscription);
app.use('/sendNotificationToAll', sendNotificationToAll);



app.get('/', (req, res) => {
  res.send('Hello World! 1')
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})
