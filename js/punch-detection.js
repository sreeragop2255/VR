AFRAME.registerComponent('punch-detection', {

    tick: function () {

        const puncher = this.el
        const targets = document.querySelectorAll('.target')

        targets.forEach(target => {

            const p = puncher.object3D.position
            const t = target.object3D.position

            const distance = p.distanceTo(t)

            if (distance < 0.35) {

                window.dispatchEvent(new Event("targetHit"))

                target.parentNode.removeChild(target)

            }

        })

    }

})