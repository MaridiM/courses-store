module.exports = {
    ifeq (a, b, options) { // Если  равно  для  HBS templates
        if (a.toString() === b.toString()) {
            return options.fn(this)
        }
        return options.inverse(this)
    }
}