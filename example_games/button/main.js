const s2d = new Saiga2D({
    show_cursor: true,
    pixel_size: 2
})

class button extends s2d.game_object {
    constructor(){
        super()
        this.fixed = true
        this.hovered = false
        this.clicked = false
        this.can_click = false
    }
    render(){
        this.update()
        this.apply_velocity()
        this.handle_interaction()
        this.draw()
    }
    handle_interaction(){
        if(s2d.mouse.hovers_game_object(this)){
            if(!this.hover){
                this.on_hover_enter()
                this.hover = true
            }
        } else {
            if(this.hover){
                this.on_hover_leave()
                this.hover = false
            }
        }
    }
    on_hover_enter(){}
    on_hover_leave(){}
    on_mouse_down(){}
    on_mouse_up(){}
}

class red_button extends button {
    constructor(){
        super()
        this.sprite = new s2d.sprite('assets/button.png')
        this.size = new s2d.rect(9)
        this.origin = new s2d.vector2(this.size.width / 2, this.size.height / 2)
    }
    on_hover_enter(){
        this.scale = new s2d.vector2(1.3)
        this.frame.y = 1
        s2d.mouse.cursor = 'pointer'
    }
    on_hover_leave(){
        this.scale = new s2d.vector2(1)
        this.frame.y = 0
        s2d.mouse.cursor = 'default'
    }
    on_mouse_down(){
        this.scale = new s2d.vector2(1.6)
        this.frame.y = 2
    }
    on_mouse_up(){
        this.scale = new s2d.vector2(1.3)
        this.frame.y = 1
    }
}

s2d.instantiate(new red_button, {position: new s2d.vector2(100, 100)})
s2d.instantiate(new red_button, {position: new s2d.vector2(125, 100)})
s2d.start()