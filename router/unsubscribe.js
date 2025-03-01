
import express from "express";
import SubscriptionSchema from "../schema/PushSubscriptionSchema.js"; // استيراد الموديل

const router = express.Router();

router.delete("/unsubscribe/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // حذف الاشتراك من قاعدة البيانات
        await SubscriptionSchema.findOneAndDelete({ user: userId });

        res.status(200).json({ message: "Subscription removed successfully" });
    } catch (error) {
        console.error("Error unsubscribing:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
