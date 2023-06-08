const screen_width = 1200
const screen_height = 800

const s2d = new Saiga2D({
    width: screen_width,
    height: screen_height,
    pixel_size: 2,
    show_cursor: false
})

class red_orb extends s2d.game_object {
    constructor(position){
        super()
        this.sprite = new s2d.sprite('assets/red_orb.png')
        this.size = new s2d.rect(15)

        this.arrow_sprite = new s2d.sprite('assets/arrow.png')
        this.arrow_size = new s2d.rect(7, 6)

        this.rotation_speed = 2
        this.move_speed = 0.1
        this.drag = 0.96

        this.direction = 0
        this.direction_vector = new s2d.vector2(0, -this.move_speed)

        this.position = position
        this.has_shot = false
    }
    update(){
        if(s2d.input['KeyW']){
            this.velocity.x += this.direction_vector.x
            this.velocity.y += this.direction_vector.y
        }
        if(s2d.input['KeyD']){
            this.direction += this.rotation_speed
            this.direction_vector.rotate(this.rotation_speed)
        }
        if(s2d.input['KeyA']){
            this.direction -= this.rotation_speed
            this.direction_vector.rotate(-this.rotation_speed)
        }
        if(s2d.input['Mouse0'] && !this.has_shot){
            this.shoot()
            this.has_shot = true
        }
        if(!s2d.input['Mouse0']) this.has_shot = false
        
        this.velocity.multiply(this.drag)
    }
    shoot(){
        s2d.instantiate(new bullet(new s2d.vector2(this.position.x + (this.size.width / 2 - 6) + (this.direction_vector.x * 150), this.position.y + (this.size.height / 2 - 6) + (this.direction_vector.y * 150)), new s2d.vector2(this.direction_vector.x * 50, this.direction_vector.y * 50)))
    }
    draw(){
        super.draw()
        const vec = new s2d.vector2(this.direction_vector.x, this.direction_vector.y)
        vec.normalize()
        vec.multiply(25)
        s2d.graphics.draw_sprite(this.arrow_sprite, this.position.x + (this.size.width / 2 - this.arrow_size.width / 2) + vec.x, this.position.y + (this.size.height / 2 - this.arrow_size.height / 2) + vec.y, this.arrow_size.width, this.arrow_size.height, this.direction, 1, 1, this.arrow_size.width / 2, this.arrow_size.height / 2, s2d.input['KeyW'] ? 1 : 0.5, 0, 0, 1, false)
    }
}

class enemy_object extends s2d.game_object {
    constructor(){
        super()
        this.max_health = 10
        this.current_health = this.max_health
        this.health_bar_size = new s2d.rect(10, 1)
        this.health_bar_bg_sprite = new s2d.sprite('assets/health_bar_bg.png')
        this.health_bar_bg_size = new s2d.rect(12, 3)
    }
    update(){
        if(this.current_health <= 0) this.kill()
    }
    draw(){
        super.draw()
        s2d.graphics.draw_sprite(this.health_bar_bg_sprite, this.position.x + this.size.width / 2 - this.health_bar_bg_size.width / 2, this.position.y + this.size.height + 2, this.health_bar_bg_size.width, this.health_bar_bg_size.height, 0, 1, 1, 0, 0, 1, 0, 0, 1, false)
        s2d.graphics.draw_rect(this.position.x + this.size.width / 2 - this.health_bar_size.width / 2, this.position.y + this.size.height + 4, this.health_bar_size.width, this.health_bar_size.height, 0, this.current_health / this.max_health, 1, 0, this.health_bar_size.height / 2, 'yellow', 1, false)
    }
}

class enemy extends enemy_object {
    constructor(){
        super()
        this.sprite = new s2d.sprite('assets/enemy_orb.png')
        this.size = new s2d.rect(15)
        this.position = new s2d.vector2(200, 100)
    }
    on_kill(){
        for (let i = 0; i < s2d.utils.rand_int(6, 8); i++) {
            s2d.instantiate(new enemy_particle, { position: new s2d.vector2(this.position.x + this.size.width / 2 - 4, this.position.y + this.size.height / 2 - 4) , velocity: new s2d.vector2(s2d.utils.rand_int(-10, 10) / 5, s2d.utils.rand_int(-10, 10) / 5) })
        }
    }
}

class enemy_particle extends s2d.game_object {
    constructor(){
        super()
        this.sprite = new s2d.sprite('assets/enemy_particle.png')
        this.size = new s2d.rect(4)
        this.life_duration = s2d.utils.rand_int(40, 80)
        this.life_duration_timer = this.life_duration
        this.drag = s2d.utils.rand_int(94, 98) / 100
        this.frame.y = s2d.utils.rand_int(0, 2)
    }
    update(){
        this.life_duration_timer--
        this.scale = new s2d.vector2(this.life_duration_timer / (this.life_duration / 2))
        this.alpha = this.life_duration_timer / this.life_duration
        if(this.life_duration_timer === 0) this.kill()
        this.velocity.x *= this.drag
        this.velocity.y *= this.drag
    }
}

class bullet extends s2d.game_object {
    constructor(position, velocity){
        super()
        this.sprite = new s2d.sprite('assets/bullet.png')
        this.size = new s2d.rect(6)
        this.position = position
        this.velocity = velocity
        this.life_duration = 200
    }
    update(){
        this.life_duration--
        this.scale = new s2d.vector2(this.life_duration / 150)
        if(this.life_duration === 0) this.kill()
    }
    on_collision(game_object){
        if (game_object instanceof enemy_object){
            game_object.current_health -= 3
            this.kill()
        }
    }
}

class cursor extends s2d.game_object {
    constructor(){
        super()
        this.sprite = new s2d.sprite('assets/cursor.png')
        this.size = new s2d.rect(7, 9)
        this.pixel_snap = true
    }
    update(){
        this.position = s2d.mouse
    }
}

s2d.instantiate(new red_orb(new s2d.vector2(screen_width / 2 - 15, screen_height / 2 - 15)))
s2d.instantiate(new enemy)
s2d.instantiate(new cursor)
s2d.start()