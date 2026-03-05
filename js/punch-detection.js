AFRAME.registerComponent('punch-detection', {

    init: function () {

        this.el.addEventListener('collide', (e) => {

            const target = e.detail.body.el

            if (!target) return

            if (target.classList.contains("target")) {

                window.dispatchEvent(new Event("targetHit"))

                target.parentNode.removeChild(target)

            }

        })

    }

})