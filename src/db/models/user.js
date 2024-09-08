import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true },
  books: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
  role: { type: String, enum: ['customer', 'employee'], required: true },
});

userSchema.index({ 'books': 1 });

export default model('User', userSchema);
