import express from "express";
import webpush from "web-push";
import SubscriptionSchema from "../schema/PushSubscriptionSchema.js";
import Dotenv from 'dotenv';

Dotenv.config();

// const sendNotificationToAll = express.Router();

// إعداد مفاتيح VAPID
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY, // المفتاح الخاص يبقى سريًا
};

webpush.setVapidDetails(
  "mailto:ramadanmahdy45@gmail.com", // بريدك الإلكتروني
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Route لإرسال الإشعارات
const sendNotificationToAll =  async (UserId) => {
  try {
    // const { title, message , UserId} = req.body;

    // جلب جميع المستخدمين المسجلين للإشعارات
    const subscription = await SubscriptionSchema.findOne({UserId});
    
    if (!subscription) {
      return { message: "No subscribers found" };
    }

    const payload = JSON.stringify({ message: " تم ارسال رساله جديده من رمضان " });
    // النص الذي سيظهر في الإشعار

   // إرسال الإشعار
   await webpush.sendNotification(subscription.subscription, payload)
   .catch(err => {
    console.error("Error sending notification:", err);
  });

    return { message: "Notifications sent successfully" };
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }
};

export default sendNotificationToAll;
