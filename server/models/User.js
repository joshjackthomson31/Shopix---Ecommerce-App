import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the structure of a User document
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],  // Validation: must have name
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,  // No two users can have same email
      lowercase: true,  // Convert to lowercase automatically
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,  // Don't include password when querying users
    },
    isAdmin: {
      type: Boolean,
      default: false,  // Regular users are not admins by default
    },
  },
  {
    timestamps: true,  // Adds createdAt and updatedAt fields automatically
  }
);

// ============ MIDDLEWARE ============
// This runs BEFORE saving a user to the database

userSchema.pre('save', async function () {
  // Only hash password if it was modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  // Hash the password with bcrypt (cost factor of 10)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ============ METHODS ============
// Custom method to compare passwords during login

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the model from the schema
const User = mongoose.model('User', userSchema);

export default User;
