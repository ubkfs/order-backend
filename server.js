const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect("mongodb+srv://unofficialubk_db:ssDxvpTadYwBsecs@cluster0.wifv9uv.mongodb.net/ordersDB?retryWrites=true&w=majority")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// ✅ Schema
const Order = mongoose.model("Order",{
  name:String,
  phone:String,
  item:String,
  quantity:Number,
  status:{type:String,default:"Pending"},
  createdAt:{type:Date,default:Date.now}
});

// ✅ Email Setup (Gmail App Password required)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "usamabinkashem03@gmail.com",
    pass: "YOUR_APP_PASSWORD"
  }
});

// ✅ Place Order API
app.post("/order", async (req,res)=>{
  try{
    const order = await Order.create(req.body);

    // 📧 Send Email to Owner
    await transporter.sendMail({
      from: "usamabinkashem03@gmail.com",
      to: "usamabinkashem03@gmail.com",
      subject: "🛒 New Order Received",
      text: `
New Order Received

Name: ${order.name}
Phone: ${order.phone}
Item: ${order.item}
Quantity: ${order.quantity}

Order ID: ${order._id}
Status: ${order.status}
      `
    });

    res.json({success:true, orderId:order._id});

  }catch(err){
    console.log(err);
    res.status(500).json({error:"Server Error"});
  }
});

// ✅ Get All Orders (Admin)
app.get("/orders", async (req,res)=>{
  const orders = await Order.find().sort({createdAt:-1});
  res.json(orders);
});

// ✅ Update Status
app.put("/order/:id", async (req,res)=>{
  await Order.findByIdAndUpdate(req.params.id,{status:req.body.status});
  res.json({success:true});
});

// ✅ Track Order
app.get("/order/:id", async (req,res)=>{
  const order = await Order.findById(req.params.id);
  res.json(order);
});

// ✅ Start Server
app.listen(5000,()=>console.log("🚀 Server running on port 5000"));