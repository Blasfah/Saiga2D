// todo

// implement pixel_size setting in classes, also move classes into main func // done
// default origin to center of sprite // done
// add aabb collision // done
// fix weird drawing outside of canvas thing // done
// add a way to listen to player input // done
// figure out a way to do screen moving // done
// add an option to lock drawing to the pixel grid // done
// add a base class called entity //done

function Saiga2D(input_settings = {}) {

    const view = document.createElement('canvas')
    const context = view.getContext('2d')

    const settings = {
        width: 800,
        height: 600,
        background_color: 'transparent',
        pixel_size: 1,
        fps: 144,
        scale_mode: 'nearest'
    }

    Object.assign(settings, input_settings)

    view.width = settings.width
    view.height = settings.height
    view.style.backgroundColor = settings.background_color

    switch (settings.scale_mode){
        case 'linear': context.imageSmoothingEnabled = true; break
        case 'nearest': context.imageSmoothingEnabled = false; break
        default: console.warn('"scale_mode" should be set to either "linear" or "nearest"'); break
    }

    class vector2 {
        constructor(x = 0, y = 0){
            this.x = x
            this.y = y
        }
        normalize() {
            const length = Math.sqrt(this.x * this.x + this.y * this.y);
            this.x /= length;
            this.y /= length;
        }
        rotate(degrees) {
            const radians = (Math.PI / 180) * degrees;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);
            const new_x = this.x * cos - this.y * sin;
            const new_y = this.x * sin + this.y * cos;
            this.x = new_x;
            this.y = new_y;
        }
    }
    
    class sprite extends Image {
        constructor(src){
            super(src)
            this.src = src
        }
    }
    
    class rect {
        constructor(width = 0, height = 0){
            this.width = width * settings.pixel_size
            this.height = height * settings.pixel_size
        }
    }

    let render_stack = []
    let render_global_id = 0
    let global_time = 0

    let screen = new vector2(0, 0)

    function draw_rect(x, y, width, height, rotation, scale_x, scale_y, origin_x, origin_y, color, alpha){

        x = pixel_snap ? (Math.round(x - screen.x)) : (x - screen.x)
        y = pixel_snap ? (Math.round(y - screen.y)) : (y - screen.y)

        setup_draw(x - screen.x, y - screen.y, rotation, scale_x, scale_y, origin_x, origin_y, alpha)
        context.fillStyle = color
        context.fillRect(x - screen.x, y - screen.y, width, height)
    }

    function draw_sprite(sprite, x, y, width, height, rotation, scale_x, scale_y, origin_x, origin_y, alpha, frame_x, frame_y, frame_gap, pixel_snap){
        const ps = settings.pixel_size

        x = pixel_snap ? (Math.round(x - screen.x)) : (x - screen.x)
        y = pixel_snap ? (Math.round(y - screen.y)) : (y - screen.y)

        setup_draw(x, y, rotation, scale_x, scale_y, origin_x, origin_y, alpha)
        context.drawImage(sprite, (width / ps + frame_gap) * frame_x, (height / ps + frame_gap) * frame_y, width / ps, height / ps, x, y, width, height)
    }

    function setup_draw(x, y, rotation, scale_x, scale_y, origin_x, origin_y, alpha){
        const offsetX = x + origin_x
        const offsetY = y + origin_y

        context.globalAlpha = alpha < 0 ? 0 : alpha

        context.resetTransform()
        context.translate(offsetX, offsetY)
        context.scale(scale_x, scale_y)
        context.rotate(rotation * (Math.PI / 180))
        context.translate(-offsetX, -offsetY)
    }

    function clear(){
        context.resetTransform()
        context.clearRect(0, 0, settings.width, settings.height)
    }

    const rand_int = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
    const lerp = (min, max, t) => min * (1 - t) + max * t
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
    const check_aabb_collision = (a, b) => a.position.x < b.position.x + b.size.width && a.position.x + a.size.width > b.position.x && a.position.y < b.position.y + b.size.height && a.position.y + a.size.height > b.position.y
    const distance = (vector1, vector2) => Math.sqrt((vector2.x - vector1.x) ** 2 + (vector2.y - vector1.y) ** 2)

    class entity {
        constructor(){
            this.id = null
            this.alive = true
        }
        render(){
            this.update()
        }
        kill(){
            this.alive = false
            this.on_kill()
        }
        update(){}
        on_kill(){}
    }

    class game_object extends entity {
        constructor(){
            super()
            this.sprite = null
            this.position = new vector2()
            this.velocity = new vector2()
            this.size = new rect()
            this.rotation = 0
            this.scale = new vector2(1, 1)
            this.origin = null
            this.alpha = 1
            this.frame = new vector2()
            this.frame_gap = 1
            this.pixel_snap = false
            this.is_colliding = false
        }
        render(){
            this.handle_collision()
            this.update()
            this.apply_velocity()
            this.draw()
        }
        draw(){
            if (!this.origin) this.origin = new vector2(this.size.width * 0.5, this.size.height * 0.5)
            if (this.sprite) draw_sprite(this.sprite, this.position.x, this.position.y, this.size.width, this.size.height, this.rotation, this.scale.x, this.scale.y, this.origin.x, this.origin.y, this.alpha, this.frame.x, this.frame.y, this.frame_gap, this.pixel_snap)
        }
        handle_collision(){
            render_stack.forEach((game_object) => {
                if(game_object !== this) check_aabb_collision(this, game_object) ? (this.on_collision(game_object), this.is_colliding = true) : this.is_colliding = false
            })
        }
        apply_velocity(){
            this.position.x += this.velocity.x
            this.position.y += this.velocity.y
        }
        on_collision(){}
    }

    function render_game_objects(){
        render_stack = render_stack.filter(({ alive }) => alive)
        render_stack.forEach((game_object) => game_object instanceof entity && game_object.render())
    }

    function update(){
        clear()
        render_game_objects()
        global_time++
        requestAnimationFrame(update)
    }

    function start(element = document.body){
        element.appendChild(view)
        element.addEventListener('keydown', (e) => keys[e.code] = true)
        element.addEventListener('keyup', (e) => keys[e.code] = false)
        update()
    }

    function instantiate(game_object, spawn_properties = {}){
        game_object.id = render_global_id
        render_global_id++
        Object.assign(game_object, spawn_properties)
        render_stack.push(game_object)
    }

    function get_global_time(){
        return global_time
    }

    const game = {
        start,
        instantiate,
        get_global_time,
        screen
    }

    const graphics = {
        draw_rect,
        draw_sprite,
        clear
    }

    const utils = {
        rand_int,
        lerp,
        clamp,
        check_aabb_collision,
        distance
    }

    const keys = {}

    return {
        entity,
        game_object,
        vector2,
        sprite,
        rect,
        game,
        graphics,
        utils,
        keys
    }
}