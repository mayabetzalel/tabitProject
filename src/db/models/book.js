import { Schema, model } from "mongoose";

const bookSchema = new Schema({
    name: { type: String, required: true },
    author: { type: String, required: true },
    topic: { type: String },
    year: { type: Number, min: 0, max: new Date().getFullYear() },
    isLoaned: { type: Boolean, default: false },
    loanDate: { type: Date },
    popularity: { type: Number, min: 1, max: 5, default: 1 }
});

bookSchema.index({ author: 1 })
bookSchema.index({ topic: 1 })  
bookSchema.index({ year: 1 })

export default model('Book', bookSchema);