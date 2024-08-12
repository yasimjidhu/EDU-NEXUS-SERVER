import { Group } from '@entities/group';
import mongoose, { model } from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image:{type:String,required:true},
    description:{type:String,required:true},
    members: [{ type: String, required: true }],
    createdAt: { type: Date, required: false, default: Date.now },
    updatedAt: { type: Date, required: false, default: Date.now },
});

export const GroupModel = model('groups', groupSchema);
