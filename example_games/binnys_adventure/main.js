const s2d = Saiga2D({
    pixel_size: 2
})

class player extends s2d.game_object {
    constructor(){
        super()
        this.sprite = new s2d.sprite('assets/binny.png')
        this.size = new s2d.rect(19, 26)
        this.last_position = new s2d.vector2(this.position.x, this.position.y)
        this.can_jump = false

        this.speed = 40
        this.jump_power = -5
        this.gravity = 0.15
        this.drag = 0.9
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

class platform extends s2d.game_object {
    constructor(){
        super()
        this.sprite = new s2d.sprite('assets/big_platform.png')
        this.size = new s2d.rect(91, 18)
        this.pixel_snap = true
    }
}

const scenes = {
    'level_1': [
        [player, {position: new s2d.vector2(200, 200 - new player().size.height)}],
        [platform, {position: new s2d.vector2(150, 200)}],
        [platform, {position: new s2d.vector2(450, 250)}],
        [platform, {position: new s2d.vector2(632, 250)}],
    ]
}

function load_scene(scene){
    scenes[scene].forEach((obj) => s2d.instantiate(new obj[0], obj[1]))
}

load_scene('level_1')
s2d.start()