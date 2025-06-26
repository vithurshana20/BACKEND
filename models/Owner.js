import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Step 1: Schema definition
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true }, // 📞 Phone number
  password: { type: String, required: true, minlength: 6 },

  role: {
    type: String,
    enum: ['player', 'court_owner', 'admin'],
    default: 'court_owner'
  },
trialEndsAt: {
  type: Date,
  default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
},
isSubscribed: {
  type: Boolean,
  default: false
},
subscriptionStartedAt: Date,
subscriptionEndsAt: Date

  // 👇 New fields for trial/subscription
  // subscribed: {
  //   type: Boolean,
  //   default: false // After 7 days, this should be true to allow full access
  // },

  // registeredAt: {
  //   type: Date,
  //   default: Date.now // Used to calculate 7-day trial
  // }

}, {
  timestamps: true
});

// ✅ Step 2: Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (!this.password) {
    return next(new Error('Password is required to hash'));
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Step 3: Add methods (e.g., password match)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Step 4: Export model
const User = mongoose.model('User', userSchema);
export default User;

// import crypto from "crypto";

// userSchema.methods.generateResetToken = function () {
//   const resetToken = crypto.randomBytes(20).toString("hex");
//   this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
//   this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
//   return resetToken;
// };