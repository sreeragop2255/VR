AFRAME.registerComponent('punch-detection', {

    schema: {
        hand: {type: 'string', default: 'left'},
        punchThreshold: {type: 'number', default: 1.5},
        cooldown: {type: 'number', default: 200}
    },

    init: function () {
        this.lastPunchTime = 0
        this.lastPosition = new THREE.Vector3()
        this.punchVelocity = new THREE.Vector3()
        this.scene = this.el.sceneEl
        this.hand = this.data.hand
        
        // Store reference to this component for event handlers
        const self = this
        
        // Listen for collision events
        this.el.addEventListener('collide', (e) => {
            this.handleCollision(e)
        })
        
        // Animation loop for punch detection
        this.scene.addEventListener('tick', () => {
            this.detectPunchVelocity()
        })
    },

    detectPunchVelocity: function () {
        const currentTime = Date.now()
        const currentPosition = this.el.object3D.position.clone()
        
        // Calculate velocity
        if (this.lastPosition) {
            this.punchVelocity = currentPosition.clone().sub(this.lastPosition)
            const velocity = this.punchVelocity.length()
            
            // Detect punch motion (fast movement forward/downward)
            const threshold = this.data.punchThreshold
            const cooldownPassed = (currentTime - this.lastPunchTime) > this.data.cooldown
            
            if (velocity > threshold && cooldownPassed) {
                this.executePunch(velocity)
                this.lastPunchTime = currentTime
            }
        }
        
        this.lastPosition = currentPosition.clone()
    },

    executePunch: function (velocity) {
        // Trigger visual feedback
        this.el.emit('punch', {velocity: velocity, hand: this.hand})
        
        // Check for target collisions
        this.checkTargetHits()
    },

    checkTargetHits: function () {
        const scene = this.scene
        const punchSphere = this.el.object3D
        const hitDistance = 0.5 // Detection radius
        
        // Get all targets
        const targets = scene.querySelectorAll('.target')
        
        targets.forEach(target => {
            if (!target.object3D) return
            
            const distance = punchSphere.position.distanceTo(target.object3D.position)
            
            if (distance < hitDistance) {
                window.dispatchEvent(new Event("targetHit"))
                target.parentNode.removeChild(target)
            }
        })
    },

    handleCollision: function (e) {
        const target = e.detail.body ? e.detail.body.el : null
        
        if (!target) return
        
        if (target.classList.contains("target")) {
            window.dispatchEvent(new Event("targetHit"))
            target.parentNode.removeChild(target)
        }
    },

    tick: function () {
        // Update hand tracking from WebXR
        this.updateControllerTracking()
    },

    updateControllerTracking: function () {
        if (!navigator.xr) return
        
        // Get gamepad data if available
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : []
        
        gamepads.forEach((gamepad) => {
            if (!gamepad) return
            
            // Check for punch trigger (squeeze button)
            if (gamepad.buttons && gamepad.buttons.length > 0) {
                const gripButton = gamepad.buttons[1] // Grip button
                const triggerButton = gamepad.buttons[0] // Trigger button
                
                if (gripButton && gripButton.pressed) {
                    this.detectPunchVelocity()
                }
            }
        })
    }

})