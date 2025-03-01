import Pusher from "pusher";
import Dotenv from "dotenv";

Dotenv.config();

// إعداد Pusher
const pusher = new Pusher({
  appId: process.env.appId,
  key: process.env.key,
  secret: process.env.secret,
  cluster: process.env.cluster,
  useTLS: true, // تأكد من أنها قيمة Boolean صحيحة
});

export default pusher;
