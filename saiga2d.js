// todo

// implement pixel_size setting in classes, also move classes into main func // done
// default origin to center of sprite // done
// add aabb collision // done
// fix weird drawing outside of canvas thing // done
// add a way to listen to player input // done
// figure out a way to do screen moving // done
// add an option to lock drawing to the pixel grid // done
// add a base class called entity //done
// add mouse position field // done
// improve input system // done
// set delta_time property // done
// rename game_object to entity in functions // done

// order of rendering using layers property
// add fixed property to draw functions
// add a text drawing function
// add blending modes

function Saiga2D(input_settings = {}) {

    const view = document.createElement('canvas')
    const context = view.getContext('2d')

    const settings = {
        width: 800,
        height: 600,
        background_color: 'transparent',
        pixel_size: 1,
        scale_mode: 'nearest',
        show_cursor: true
    }

    Object.assign(settings, input_settings)

    view.width = settings.width
    view.height = settings.height
    view.style.backgroundColor = settings.background_color
    view.style.cursor = settings.show_cursor ? 'default' : 'none'

    switch (settings.scale_mode){
        case 'linear': context.imageSmoothingEnabled = true; break
        case 'nearest': context.imageSmoothingEnabled = false; break
        default: console.warn('"scale_mode" should be set to either "linear" or "nearest"'); break
    }

    class vector2 {
        constructor(x = 0, y = x){
            this.x = x
            this.y = y
        }
        add(input_vector2){
            return new vector2(this.x + input_vector2.x, this.y + input_vector2.y)
        }
        subtract(input_vector2) {
            return new vector2(this.x - input_vector2.x, this.y - input_vector2.y)
        }
        multiply(scalar_x, scalar_y = scalar_x){
            return new vector2(this.x * scalar_x, this.y * scalar_y)
        }
        divide(scalar_x, scalar_y = scalar_x){
            return new vector2(this.x / scalar_x, this.y / scalar_y)
        }
        length() {
            return Math.sqrt(this.x * this.x + this.y * this.y)
        }
        normalize() {
            const length = this.length()
            return new vector2(this.x / length, this.y / length)
        }
        rotate(degrees) {
            const radians = (Math.PI / 180) * degrees
            const cos = Math.cos(radians)
            const sin = Math.sin(radians)
            return new vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos)
        }
        copy(){
            return new vector2(this.x, this.y)
        }
    }
    
    class sprite extends Image {
        constructor(src){
            super(src)
            this.src = src
        }
    }
    
    class rect {
        constructor(width = 0, height = width){
            this.width = width * settings.pixel_size
            this.height = height * settings.pixel_size
        }
    }

    class game_time {
        constructor(){
            this.delta = 0
            this.global = 0
        }
    }

    let render_stack = []
    let render_global_id = 0

    const screen = new vector2
    const mouse = new vector2
    const time = new game_time
    const input = {}

    function draw_rect(x, y, width, height, rotation, scale_x, scale_y, origin_x, origin_y, color, alpha, pixel_snap, fixed){

        const calc_x = fixed ? x : x - screen.x
        const calc_y = fixed ? y : y - screen.y

        x = pixel_snap ? Math.round(calc_x) : calc_x
        y = pixel_snap ? Math.round(calc_y) : calc_y

        setup_draw(x, y, rotation, scale_x, scale_y, origin_x, origin_y, alpha)
        context.fillStyle = color
        context.fillRect(x, y, width, height)
    }

    function draw_sprite(sprite, x, y, width, height, rotation, scale_x, scale_y, origin_x, origin_y, alpha, frame_x, frame_y, frame_gap, pixel_snap, fixed){
        const ps = settings.pixel_size

        const calc_x = fixed ? x : x - screen.x
        const calc_y = fixed ? y : y - screen.y

        x = pixel_snap ? Math.round(calc_x) : calc_x
        y = pixel_snap ? Math.round(calc_y) : calc_y

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
            this.fixed = false
            this.is_colliding = false
        }
        render(){
            this.update()
            this.apply_velocity()
            this.handle_collision()
            this.draw()
        }
        draw(){
            if (!this.origin) this.origin = new vector2(this.size.width * 0.5, this.size.height * 0.5)
            if (this.sprite) draw_sprite(this.sprite, this.position.x, this.position.y, this.size.width, this.size.height, this.rotation, this.scale.x, this.scale.y, this.origin.x, this.origin.y, this.alpha, this.frame.x, this.frame.y, this.frame_gap, this.pixel_snap, this.fixed)
        }
        handle_collision(){
            render_stack.forEach((object) => {
                if(object !== this) check_aabb_collision(this, object) ? (this.on_collision(object), this.is_colliding = true) : this.is_colliding = false
            })
        }
        apply_velocity(){
            this.position = this.position.add(this.velocity)
        }
        on_collision(){}
    }

    function render(){
        render_stack = render_stack.filter(({ alive }) => alive)
        render_stack.forEach((object) => object instanceof entity && object.render())
    }

    function add_events(element){
        element.addEventListener('keydown', (e) => input[e.code] = true)
        element.addEventListener('keyup', (e) => input[e.code] = false)
        element.addEventListener('mousedown', (e) => input['Mouse' + e.button] = true)
        element.addEventListener('mouseup', (e) => input['Mouse' + e.button] = false)
        view.addEventListener('mousemove', (e) => (mouse.x = e.offsetX, mouse.y = e.offsetY))
        view.addEventListener('contextmenu', (e) => e.preventDefault())
    }

    let prev_timestamp = null

    function update(timestamp){
        if(!prev_timestamp) prev_timestamp = timestamp
        time.delta = (timestamp - prev_timestamp) / 1000
        time.global++
        prev_timestamp = timestamp

        clear()
        render()
        requestAnimationFrame(update)
    }

    function start(element = document.body){
        element.appendChild(view)
        add_events(element)
        requestAnimationFrame(update)
    }

    function instantiate(object, spawn_properties = {}){
        object.id = render_global_id
        render_global_id++
        Object.assign(object, spawn_properties)
        render_stack.push(object)
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

    return {
        start,
        instantiate,
        entity,
        game_object,
        vector2,
        sprite,
        rect,
        time,
        input,
        mouse,
        screen,
        graphics,
        utils
    }
}