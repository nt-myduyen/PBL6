import { Schema, Document } from "mongoose";
import { User } from "src/user/user.model";

const CourseSchema = new Schema(
    {
        title: String,
        description: String,
        price: Number,
        discount: Number,
        duration: Number,
        users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        image: String,
        creator: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    {
        toObject: {virtuals: true},
        timestamps: true,
        collection: 'courses',
    }
)

CourseSchema.virtual('lessons', {
    ref: 'Lesson',
    localField: '_id',
    foreignField: 'course',
    justOne: false,
});

export { CourseSchema };
export interface Course extends Document {
    title: string;
    description: string;
    price: number;
    discount: number;
    duration: number;
    users: [User];
    image: string;
    creator: User;
}