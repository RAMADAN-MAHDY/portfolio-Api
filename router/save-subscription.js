import express from "express";
import PushSubscription from "../schema/PushSubscriptionSchema.js"; // استدعاء الموديل

const subscribe = express.Router();

// 🔹 حفظ أو تحديث اشتراك المستخدم
subscribe.post("/", async (req, res) => {
    try {
        console.log("📩 Received Subscription Data:", req.body);
        const {UserId , subscription } = req.body;

        if (!UserId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: "Invalid subscription data" });
        }


         // تحديث الاشتراك إذا كان موجودًا أو إنشاء اشتراك جديد باستخدام userId
        const updatedSubscription = await PushSubscription.findOneAndUpdate(
            { UserId }, // البحث باستخدام userId
            { UserId, subscription }, // تحديث بيانات الاشتراك مع الـ userId
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: "Subscription saved successfully", data: updatedSubscription });
    } catch (error) {
        console.error("❌ Error saving subscription:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

export default subscribe;
