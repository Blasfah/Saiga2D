const s2d = new Saiga2D({
    show_cursor: true,
    pixel_size: 2
})

class button extends s2d.game_object {
    constructor(){
        super()
        this.sprite = new s2d.sprite('assets/button.png')
        this.size = new s2d.rect(9)
        this.origin = new s2d.vector2(this.size.width / 2, this.size.height / 2)

        this.hovered = false
    }
    update(){
        if(s2d.mouse.hovers_game_object(this)){
            if(s2d.input['Mouse0']){
                this.frame.y = 2
                this.scale = new s2d.vector2(1.6)
            } else {
                this.frame.y = 1
                this.scale = new s2d.vector2(1.3)
            }
            s2d.mouse.cursor = 'pointer'
            this.hovered = true
        } else {
            this.frame.y = 0
            this.scale = new s2d.vector2(1)
            if(this.hovered){
                s2d.mouse.cursor = 'default'
                this.hovered = false
            }
        }
    }
}


s2d.instantiate(new button, {position: new s2d.vector2(100, 100)})
s2d.instantiate(new button, {position: new s2d.vector2(150, 100)})
s2d.start()