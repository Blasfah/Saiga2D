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
// add fixed property to draw functions // done
// remove origin default // done
// possibly remove frame gap // done
// draw funcs take in vec2 instead // done
// add a line drawing function // done
// fix weird screen moving bug // done
// add a text drawing function // done
// improve text drawing with a text class // done
// seems when making a new class the constructor is called twice // needs investigation // done
// initially setting a text gives the wrong width only when its a custom font

// order of rendering using layers property
// add blending modes
// add filters
// make the dx of adding params to classes better and not like the current dogshit thing "this is game ready" my ass
// give access to settings object // maybe
// improve pixel size setting aka make it not confusing as shit

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

    class text {
        constructor(content = '', font = 'arial', text_size = '16px', line_height = text_size){
            this.content = content
            this.font = is_font_src(font) ? get_file_name(font) : font
            this.text_size = text_size
            this.line_height = line_height
            this.size = new rect()

            is_font_src(font) ? new FontFace(this.font, `url(${font})`).load().then((font) => {
                document.fonts.add(font)
                this.calc_size()
            }) : this.calc_size()
        }
        calc_size(){
            this.lines = this.content.split('\n')
            this.size.width = 0
            this.size.height = (this.lines.length * parseInt(this.line_height)) - (parseInt(this.line_height) - parseInt(this.text_size))
            context.font = `${this.text_size} ${this.font}`
            this.lines.forEach((line) => {
                const line_width = context.measureText(line).width
                if (line_width > this.size.width) this.size.width = line_width
            })
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

    function draw_rect(color, position = new vector2(), size = new vector2(), rotation = 0, scale = new vector2(1), origin = new vector2(), alpha = 1, pixel_snap = false, fixed = false){
        position = calc_pos(position.copy(), pixel_snap, fixed) 
        setup_draw(position, rotation, scale, origin, alpha)
        context.fillStyle = color
        context.fillRect(position.x, position.y, size.width, size.height)
    }

    function draw_sprite(sprite, position = new vector2(), size = new vector2(), rotation = 0, scale = new vector2(1), origin = new vector2(), alpha = 1, frame = new vector2(), pixel_snap = false, fixed = false){
        const ps = settings.pixel_size
        const frame_gap = 1
        position = calc_pos(position.copy(), pixel_snap, fixed) 
        setup_draw(position, rotation, scale, origin, alpha)
        context.drawImage(sprite, (size.width / ps + frame_gap) * frame.x, (size.height / ps + frame_gap) * frame.y, size.width / ps, size.height / ps, position.x, position.y, size.width, size.height)
    }

    function draw_line(color, start_position, end_position, width = 1, alpha = 1, pixel_snap = false, fixed = false){
        start_position = calc_pos(start_position.copy(), pixel_snap, fixed)
        end_position = calc_pos(end_position.copy(), pixel_snap, fixed)
        context.resetTransform()
        context.beginPath()
        context.moveTo(start_position.x, start_position.y)
        context.lineTo(end_position.x, end_position.y)
        context.strokeStyle = color
        context.lineWidth = width
        context.globalAlpha = alpha < 0 ? 0 : alpha
        context.stroke()
    }

    function draw_text(text, color = 'black', position = new vector2(), rotation = 0, scale = new vector2(1), origin = new vector2(), alpha = 1, pixel_snap = false, fixed = false){
        position = calc_pos(position.copy(), pixel_snap, fixed) 
        setup_draw(position, rotation, scale, origin, alpha)
        context.fillStyle = color
        context.font = `${text.text_size} ${text.font}`
        context.textBaseline = 'top'
        text.lines.forEach((line, index) => context.fillText(line, position.x, position.y + (index * parseInt(text.line_height))))
    }

    function setup_draw(position, rotation, scale, origin, alpha){
        const offset = new s2d.vector2(position.x + origin.x, position.y + origin.y)
        context.globalAlpha = alpha < 0 ? 0 : alpha
        context.resetTransform()
        context.translate(offset.x, offset.y)
        context.scale(scale.x, scale.y)
        context.rotate(rotation * (Math.PI / 180))
        context.translate(-offset.x, -offset.y)
    }

    function calc_pos(position, pixel_snap, fixed){
        if(!fixed) position = new vector2(position.x - screen.x, position.y - screen.y)
        if(pixel_snap) position = new vector2(Math.round(position.x), Math.round(position.y))
        return position
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
    const is_font_src = src => /\.(ttf|otf|woff|woff2|eot|svg)$/i.test(src)
    const get_file_name = path => path.split('/').pop().split('.')[0]

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
            this.scale = new vector2(1)
            this.origin = new vector2()
            this.alpha = 1
            this.frame = new vector2()
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
            if (this.sprite) draw_sprite(this.sprite, this.position, this.size, this.rotation, this.scale, this.origin, this.alpha, this.frame, this.pixel_snap, this.fixed)
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

    function add_events(){
        document.body.addEventListener('keydown', (e) => input[e.code] = true)
        document.body.addEventListener('keyup', (e) => input[e.code] = false)
        document.body.addEventListener('mousedown', (e) => input['Mouse' + e.button] = true)
        document.body.addEventListener('mouseup', (e) => input['Mouse' + e.button] = false)
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
        add_events()
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
        draw_line,
        draw_text,
        clear
    }

    const utils = {
        rand_int,
        lerp,
        clamp,
        check_aabb_collision,
        distance,
        is_font_src,
        get_file_name
    }

    return {
        start,
        instantiate,
        entity,
        game_object,
        vector2,
        sprite,
        rect,
        text,
        time,
        input,
        mouse,
        screen,
        graphics,
        utils
    }
}