let score = 0
let time = 30

window.addEventListener("targetHit", () => {

    score++

    document
        .querySelector("#scoreText")
        .setAttribute("value", "Score: " + score)

})

setInterval(() => {

    time--

    document
        .querySelector("#timerText")
        .setAttribute("value", "Time: " + time)

    if (time <= 0) {

        alert("Game Over! Score: " + score)

        location.reload()

    }

}, 1000)