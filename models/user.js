const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        reguired: true
    },
    name: String,
    password: {
        type: String,
        reguired: true
    },
    avatarUrl: String,
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [
            {
                count: {
                    type: Number,
                    reguired: true,
                    default: 1
                },
                courseId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course', 
                    reguired: true,

                }
            }
        ]
    }
})


userSchema.methods.addToCart = function (course) {
    const items = [...this.cart.items]
    const idx = items.findIndex(c => c.courseId.toString() === course._id.toString())


    if (idx >= 0) {
        // Если  0  или больше то добавляем 1
        items[idx].count += 1
    } else { 
        // Если такого индекса нет то добавляем в масив, обьект 
        items.push({
            courseId: course._id,
            count: 1
        })
    }   

    this.cart = {items}  // перезаписываем данные в обьекте карт
    return this.save()   // сохраняем в БД 
}

userSchema.methods.removeFromCart = function (id) {
    let items = [...this.cart.items]
    const idx = items.findIndex(c => c.courseId.toString() === id.toString())

    if(items[idx].count === 1) {
        items = items.filter(c => c.courseId.toString() !== id.toString())
    } else {
        items[idx].count-- 
    }

    this.cart = {items}
    return this.save()
}


userSchema.methods.clearCart = function () {
    this.cart = {items: []}
    return this.save()
}

module.exports = model("User", userSchema)