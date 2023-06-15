const s2d = Saiga2D({
    pixel_size: 2
})

const [vector2, rect, sprite, text, game_object] = [s2d.vector2, s2d.rect, s2d.sprite, s2d.text, s2d.game_object]

s2d.fonts.add_font('terraria', 'assets/font.ttf')

class player extends game_object {
    constructor(){
        super()
        this.sprite = new sprite('assets/binny.png')
        this.size = new rect(19, 26)
        this.origin =  new vector2(this.size.width / 2, this.size.height / 2)

        this.last_position = this.position.copy()
        this.can_jump = false

        this.speed = 40
        this.jump_power = -5
        this.gravity = 0.15
        this.drag = 0.9

        this.text = new text('', '18px', 'terraria')
    }
    update(){
        if(s2d.input['KeyA']) this.velocity.x += -this.speed * s2d.time.delta
        if(s2d.input['KeyD']) this.velocity.x += this.speed * s2d.time.delta
        if((s2d.input['Space'] || s2d.input['KeyW']) && this.can_jump) this.velocity.y = this.jump_power, this.can_jump = false 
        
        this.velocity.x *= Math.pow(1 - this.drag, s2d.time.delta * 6)
        this.velocity.y += this.gravity

        this.rotation = this.velocity.x * 4
        !this.can_jump ? this.frame.y = 1 : this.frame.y = 0
        this.last_position = this.position.copy()

        this.text.content = `x: ${Math.round(this.position.x)},\ny: ${Math.round(this.position.y)}`
    }
    draw(){
        super.draw()
        //s2d.graphics.draw_rect('red', this.position, this.size, 0, new vector2(1), this.origin, this.alpha / 4, this.pixel_snap, this.fixed)
        s2d.graphics.draw_line('blue', new vector2(this.position.x + this.size.width / 2, this.position.y + this.size.height / 2), new vector2((this.position.x + this.size.width / 2) + this.velocity.x * 20, (this.position.y + this.size.height / 2) + this.velocity.y * 20), 2, 0.5)
        s2d.graphics.draw_text(this.text, 'black', new vector2(this.position.x, this.position.y - this.text.size.height - 10))
        //s2d.graphics.draw_rect('green', new vector2(this.position.x, this.position.y - this.text.size.height), this.text.size, 0, new vector2(1), new vector2(), 0.2)
    }
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
        this.sprite = new sprite('assets/platform.png')
        this.size = new rect(48, 16)
        this.pixel_snap = true
    }
}

const scenes = {
    'level_1': [
        [player, {position: new vector2(200, 200 - new player().size.height)}],
        [platform, {position: new vector2(170, 200)}],
        [platform, {position: new vector2(270, 200)}],
    ]
}

function load_scene(scene){
    scenes[scene].forEach((obj) => s2d.instantiate(new obj[0], obj[1]))
}

load_scene('level_1')
s2d.start()