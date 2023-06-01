const s2d = new Saiga2D({
    pixel_size: 2
})

class ball extends s2d.game_object {
    constructor(){
        super()
        this.sprite = new s2d.sprite('assets/ball.png')
        this.size = new s2d.rect(15, 15)

        this.arrow_sprite = new s2d.sprite('assets/arrow.png')
        this.arrow_size = new s2d.rect(7, 6)

        this.rotation_speed = 2
        this.move_speed = 0.1
        this.drag = 0.96

        this.direction = 0
        this.direction_vector = new s2d.vector2(0, -this.move_speed)

        this.position = new s2d.vector2(100, 100)
    }
    update(){
        if(s2d.keys.KeyW){
            this.velocity.x += this.direction_vector.x
            this.velocity.y += this.direction_vector.y
        }
        if(s2d.keys.KeyD){
            this.direction += this.rotation_speed
            this.direction_vector.rotate(this.rotation_speed)
        }
        if(s2d.keys.KeyA){
            this.direction -= this.rotation_speed
            this.direction_vector.rotate(-this.rotation_speed)
        }
        this.velocity.x *= this.drag
        this.velocity.y *= this.drag
    }
    draw(){
        super.draw()
        s2d.graphics.draw_sprite(this.arrow_sprite, this.position.x + (this.size.width / 2 - this.arrow_size.width / 2) + (this.direction_vector.x * 250), this.position.y + (this.size.height / 2 - this.arrow_size.height / 2) + (this.direction_vector.y * 250), this.arrow_size.width, this.arrow_size.height, this.direction, 1, 1, this.arrow_size.width / 2, this.arrow_size.height / 2, 1, 0, 0, 1, false)
    }
}

s2d.game.instantiate(new ball)
s2d.game.start()