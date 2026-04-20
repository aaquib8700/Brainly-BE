import mongoose, { model, Schema } from "mongoose";
mongoose.connect("mongodb://localhost:27017/brainly-database");
const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: String,
});
export const UserModel = mongoose.model("User", UserSchema);
const ContentSchema = new Schema({
    title: String,
    link: String,
    type: String,
    tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
});
export const ContentModel = mongoose.model("Content", ContentSchema);
const LinkSchema = new Schema({
    hash: String,
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
});
export const LinkModel = mongoose.model("Link", LinkSchema);
//# sourceMappingURL=db.js.map