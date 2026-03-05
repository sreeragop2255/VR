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
        this.raycaster = new THREE.Raycaster()
        this.isMouseDown = false

        // Mouse down event
        document.addEventListener('mousedown', (e) => {
            this.isMouseDown = true
            this.handleMousePunch(e)
        })

        // Mouse up event
        document.addEventListener('mouseup', (e) => {
            this.isMouseDown = false
        })

        // Touch events for controllers
        this.el.addEventListener('touchstart', (e) => {
            this.handleTouchPunch(e)
        })

        this.el.addEventListener('touchmove', (e) => {
            if (this.isMouseDown) {
                this.handleMousePunch(e)
            }
        })
    },

    tick: function () {
        this.detectPunchVelocity()
        
        // Detect controller button presses for VR
        if (navigator.getGamepads) {
            const gamepads = navigator.getGamepads()
            this.checkControllerButtons(gamepads)
        }
    },

    detectPunchVelocity: function () {
        const currentTime = Date.now()
        
        if (!this.el.object3D) return
        
        const currentPosition = this.el.object3D.position.clone()
        
        // Calculate velocity
        if (this.lastPosition) {
            this.punchVelocity = currentPosition.clone().sub(this.lastPosition)
            const velocity = this.punchVelocity.length()
            
            // Detect punch motion (fast movement forward/downward)
            const threshold = this.data.punchThreshold
            const cooldownPassed = (currentTime - this.lastPunchTime) > this.data.cooldown
            
            if (velocity > threshold && cooldownPassed) {
                this.executePunch(velocity, 'velocity')
                this.lastPunchTime = currentTime
            }
        }
        
        this.lastPosition = currentPosition.clone()
    },

    handleMousePunch: function (e) {
        const currentTime = Date.now()
        const cooldownPassed = (currentTime - this.lastPunchTime) > this.data.cooldown
        
        if (!cooldownPassed) return
        
        // Get mouse position
        const mouse = new THREE.Vector2()
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
        
        // Get camera and raycaster
        const camera = this.scene.querySelector('[camera]').object3D
        this.raycaster.setFromCamera(mouse, camera)
        
        // Get all targets
        const targets = this.scene.querySelectorAll('.target')
        const targetObjects = Array.from(targets).map(t => t.object3D)
        
        // Check intersections
        const intersects = this.raycaster.intersectObjects(targetObjects)
        
        if (intersects.length > 0) {
            this.lastPunchTime = currentTime
            const targetObject = intersects[0].object
            const targetElement = targetObject.el
            
            if (targetElement && targetElement.classList.contains('target')) {
                window.dispatchEvent(new Event("targetHit"))
                this.executePunch(1.0, 'mouse')
                if (targetElement.parentNode) {
                    targetElement.parentNode.removeChild(targetElement)
                }
            }
        }
    },

    handleTouchPunch: function (e) {
        const currentTime = Date.now()
        const cooldownPassed = (currentTime - this.lastPunchTime) > this.data.cooldown
        
        if (!cooldownPassed) return
        
        // Get touch position
        if (e.touches && e.touches.length > 0) {
            const touch = e.touches[0]
            
            const mouse = new THREE.Vector2()
            mouse.x = (touch.clientX / window.innerWidth) * 2 - 1
            mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1
            
            // Get camera and raycaster
            const camera = this.scene.querySelector('[camera]').object3D
            this.raycaster.setFromCamera(mouse, camera)
            
            // Get all targets
            const targets = this.scene.querySelectorAll('.target')
            const targetObjects = Array.from(targets).map(t => t.object3D)
            
            // Check intersections
            const intersects = this.raycaster.intersectObjects(targetObjects)
            
            if (intersects.length > 0) {
                this.lastPunchTime = currentTime
                const targetObject = intersects[0].object
                const targetElement = targetObject.el
                
                if (targetElement && targetElement.classList.contains('target')) {
                    window.dispatchEvent(new Event("targetHit"))
                    this.executePunch(1.0, 'touch')
                    if (targetElement.parentNode) {
                        targetElement.parentNode.removeChild(targetElement)
                    }
                }
            }
        }
    },

    checkControllerButtons: function (gamepads) {
        const currentTime = Date.now()
        const cooldownPassed = (currentTime - this.lastPunchTime) > this.data.cooldown
        
        if (!cooldownPassed) return
        
        gamepads.forEach((gamepad, index) => {
            if (!gamepad) return
            
            // Check for trigger button (button 0) or grip button (button 1)
            if (gamepad.buttons && gamepad.buttons.length > 0) {
                const triggerButton = gamepad.buttons[0]
                const gripButton = gamepad.buttons[1]
                
                // Trigger punch on button press
                if ((triggerButton && triggerButton.pressed) || (gripButton && gripButton.pressed)) {
                    // Use controller ray for hit detection
                    this.detectControllerRayHit(index)
                    this.lastPunchTime = currentTime
                }
            }
        })
    },

    detectControllerRayHit: function (gamepadIndex) {
        if (!this.scene) return
        
        const punchSphere = this.el.object3D
        const hitDistance = 0.5 // Detection radius
        
        // Get all targets
        const targets = this.scene.querySelectorAll('.target')
        
        targets.forEach(target => {
            if (!target.object3D) return
            
            const distance = punchSphere.position.distanceTo(target.object3D.position)
            
            if (distance < hitDistance) {
                window.dispatchEvent(new Event("targetHit"))
                this.executePunch(distance, 'controller')
                if (target.parentNode) {
                    target.parentNode.removeChild(target)
                }
            }
        })
    },

    executePunch: function (velocity, source) {
        // Trigger visual feedback
        this.el.emit('punch', {velocity: velocity, hand: this.hand, source: source})
    }

})