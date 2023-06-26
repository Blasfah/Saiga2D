const s2d = Saiga2D({
    pixel_size: 2,
    background_color: '#8dcdff'
})

const [vector2, rect, sprite, text, game_object] = [s2d.vector2, s2d.rect, s2d.sprite, s2d.text, s2d.game_object]

s2d.graphics.filter.drop_shadow(4, 4, 0, 'rgba(0, 0, 0, 0.25)')

class player extends game_object {
    constructor(){
        super()
        this.sprite = new sprite('assets/binny.png')
        this.size = new rect(19, 26)
        this.origin =  new vector2(this.size.width / 2, this.size.height / 2)

        this.last_position = this.position.copy()
        this.can_jump = false

        this.speed = 0.3
        this.jump_power = -5
        this.gravity = 0.15
        this.drag = 0.9

        this.pos_text = new text('', 'assets/font.ttf', '20px')
    }
    update(){
        if(s2d.input['KeyA']) this.velocity.x += -this.speed
        if(s2d.input['KeyD']) this.velocity.x += this.speed
        if((s2d.input['Space'] || s2d.input['KeyW']) && this.can_jump) this.velocity.y = this.jump_power, this.can_jump = false 
        
        this.velocity.x *= this.drag
        this.velocity.y += this.gravity

        this.rotation = this.velocity.x * 4
        !this.can_jump ? this.frame.y = 1 : this.frame.y = 0
        this.last_position = this.position.copy()

        //this.pos_text.content = `x: ${Math.round(this.position.x)}\ny: ${Math.round(this.position.y)}`
        //this.pos_text.calc_size()
    }
    // draw(){
    //     super.draw()
    //     s2d.graphics.draw_rect('red', this.position, this.size, 0, new vector2(1), this.origin, this.alpha / 4, this.pixel_snap, this.fixed)
    //     s2d.graphics.draw_line('blue', new vector2(this.position.x + this.size.width / 2, this.position.y + this.size.height / 2), new vector2((this.position.x + this.size.width / 2) + this.velocity.x * 20, (this.position.y + this.size.height / 2) + this.velocity.y * 20), 2, 0.5)
        
    //     const height_offset = this.pos_text.size.height + 5
    //     s2d.graphics.draw_text(this.pos_text, 'black', new vector2(this.position.x + 2, this.position.y - height_offset))
    //     s2d.graphics.draw_text(this.pos_text, 'black', new vector2(this.position.x - 2, this.position.y - height_offset))
    //     s2d.graphics.draw_text(this.pos_text, 'black', new vector2(this.position.x, this.position.y + 2 - height_offset))
    //     s2d.graphics.draw_text(this.pos_text, 'black', new vector2(this.position.x, this.position.y - 2 - height_offset))

    //     s2d.graphics.draw_text(this.pos_text, 'white', new vector2(this.position.x, this.position.y - height_offset))

    //     s2d.graphics.draw_rect('green', new vector2(this.position.x, this.position.y - height_offset), this.pos_text.size, 0, new vector2(1), new vector2(), 0.2)
    // }
    on_collision(obj){
        if(obj instanceof platform){
            if(this.last_position.y + this.size.height <= obj.position.y) this.velocity.y = 0, this.position.y = obj.position.y - this.size.height, this.can_jump = true
            else if(this.last_position.y >= obj.position.y + obj.size.height) this.velocity.y = 0, this.position.y = obj.position.y + obj.size.height
            else if(this.last_position.x + this.size.width <= obj.position.x) this.velocity.x = 0, this.position.x = obj.position.x - this.size.width
            else if(this.last_position.x >= obj.position.x + obj.size.width) this.velocity.x = 0, this.position.x = obj.position.x + obj.size.width
        }
    }
}

class platform extends game_object {
    constructor(){
        super()
        this.pixel_snap = true
    }
    draw(){
        s2d.graphics.filter.invert(1)
        super.draw()
        s2d.graphics.filter.reset('invert')
    }
}

class platform_1 extends platform {
    constructor(){
        super()
        this.sprite = new sprite('assets/platform_1.png')
        this.size = new rect(37, 16)
    }
}

class platform_2 extends platform {
    constructor(){
        super()
        this.sprite = new sprite('assets/platform_2.png')
        this.size = new rect(60, 17)
    }
}

class platform_3 extends platform {
    constructor(){
        super()
        this.sprite = new sprite('assets/platform_3.png')
        this.size = new rect(95, 20)
    }
}

class star extends game_object {
    constructor(){
        super()
        this.sprite = new sprite('assets/star.png')
        this.size = new rect(17, 15)
        this.origin = new vector2(this.size.width / 2, this.size.height / 2)

        this.particle_timer = 0
        this.frame_timer = 0
    }
    update(){
        this.rotation = 6 * Math.sin(s2d.time.global / 25)
        this.velocity.y = Math.sin(s2d.time.global / 45) / 10
        this.scale = new vector2((Math.sin(s2d.time.global * 25) / 30) + 1)

        this.particle_timer++
        if(this.particle_timer === 25){
            s2d.instantiate(new sparkle, {position: new vector2(this.position.x + (this.size.width / 2) - 6, this.position.y + (this.size.height / 2) - 6) , velocity: new vector2(s2d.utils.rand_int(-20, 20) / 10, s2d.utils.rand_int(-20, 20) / 10)})
            this.particle_timer = 0
        }

        this.frame_timer++
        if(this.frame_timer >= 20){
            if(this.frame.y == 4){
                this.frame.y = 0
            } else {
                this.frame.y++
            }
            this.frame_timer = 0
        }
    }
    on_collision(obj){
        if(obj instanceof player) this.kill()
    }
}

class sparkle extends game_object {
    constructor(){
        super()
        this.sprite = new sprite('assets/sparkle.png')
        this.size = new rect(6)
        this.origin = new vector2(this.size.width / 2, this.size.height / 2)
        this.time_left = 100
    }
    update(){
        this.time_left--
        if(this.time_left <= 0) this.kill()
        this.velocity = this.velocity.multiply(0.94)
        this.scale = new vector2(this.time_left / 100)
    }
}

class sawblade extends game_object {
    constructor(){
        super()
        this.sprite = new sprite('assets/sawblade.png')
        this.size = new rect(18)
        this.origin = new vector2(this.size.width / 2, this.size.height / 2)
    }
    update(){
        this.rotation -= 4
    }
    on_collision(obj){
        if(obj instanceof player) obj.kill()
    }
}

class sawblade_object extends game_object {
    constructor(){
        super()
        this.sawblade = new sawblade
        this.rotation_vector = new vector2(0, 115)
        this.rotation = 0
        s2d.instantiate(this.sawblade)
    }
    update(){
        this.rotation += 1
        this.sawblade.position = new vector2(-this.sawblade.size.width / 2, -this.sawblade.size.height / 2).add(this.position.add(this.rotation_vector.rotate(this.rotation)))
    }
    // draw(){
    //     s2d.graphics.draw_line('black', new vector2(this.position.x + (this.size.width / 2), this.position.y + (this.size.height / 2)), new vector2(this.sawblade.position.x + (this.sawblade.size.width / 2), this.sawblade.position.y + (this.sawblade.size.height / 2)), 2)
    // }
}

const scenes = {
    'level_1': [
        [player, {position: new vector2(100 + 38 - 19, 200)}],
        [platform_1, {position: new vector2(100, 300)}],
        [platform_2, {position: new vector2(300, 275)}],
        [platform_3, {position: new vector2(300 - 34.5, 450)}],
        [platform_1, {position: new vector2(560, 300)}],
        [sawblade_object, {position: new vector2(360, 275)}],
        [star, {position: new vector2(560 + 38 - 17, 200)}],
    ]
}

function load_scene(scene){
    scenes[scene].forEach((obj) => s2d.instantiate(new obj[0], obj[1]))
}

load_scene('level_1')
s2d.start()