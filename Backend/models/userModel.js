import mongoose from 'mongoose';
import validator from "validator";

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "username harus diisi"],
        unique: [true, 'Username sudah digunakan']
    },
    password: {
        type: String,
        required: [true, "Password harus diisi"],
        minLength: [6, "Password minimal 6 karakter"],
    },
    email: {
        type: String,
        required: [true, "Email harus diisi"],
        unique: [true, "Email sudah pernah didaftarkan"],
        validate: {
            validator: validator.isEmail,
            message: "Inputan harus berformat Email. Ex : abc@gmail.com"
        }
    },
    nama: {
        type: String,
        required: [true, "Nama harus diisi"],
        unique: [true, 'Username sudah digunakan']
    },
    role : {
        type : String,
        enum : ['admin', 'customer'],
        default : 'customer',
        required : [true, "Role harus diisi"]
    }
});

// ❌ Hapus middleware hashing
// userSchema.pre("save", async function() {
//     const salt = await bycrypt.genSalt(10)
//     this.password = await bycrypt.hash(this.password, salt)
// })

// ❌ Hapus comparePassword jika tidak pakai bcrypt
// userSchema.methods.comparePassword = async function(reqBody){
//     return await bycrypt.compare(reqBody, this.password)
// }

const User = mongoose.model("User", userSchema);

export default User;
