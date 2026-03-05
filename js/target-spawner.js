AFRAME.registerComponent('target-spawner', {

    init: function () {

        setInterval(() => {

            const scene = document.querySelector('a-scene')

            const target = document.createElement('a-sphere')

            target.setAttribute('radius', '0.25')
            target.setAttribute('color', 'yellow')
            target.setAttribute('class', 'target')

            const x = (Math.random() - 0.5) * 4
            const y = 1 + Math.random() * 2
            const z = -2 - Math.random() * 2

            target.setAttribute('position', `${x} ${y} ${z}`)

            target.setAttribute('animation', `
        property: scale;
        to: 1.2 1.2 1.2;
        dir: alternate;
        dur: 500;
        loop: true
      `)

            scene.appendChild(target)

        }, 1500)

    }

})