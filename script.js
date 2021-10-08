'use strict';

const screen = document.getElementById('screen');

const controlls = {
    firstPlayer: {
        top: 'KeyW',
        left: 'KeyA',
        bottom: 'KeyS',
        right: 'KeyD',
        attack: 'Space',
    },
    secondPlayer: {
        top: 'ArrowUp',
        left: 'ArrowLeft',
        bottom: 'ArrowDown',
        right: 'ArrowRight',
        attack: 'Numpad0',
    }
}

const playerName = Math.random() * 1000 + '';

const playerVisualized = {}
const playerList = []

const armourVisualized = {}
const armorList = []

class Armour {
    constructor(color, id, spawnPositionX, spawnPositionY, spawnPositionZ, speed, damage) {
        this.color = color;
        this.id = id;
        this.x = spawnPositionX /*ДЛЯ КОМПЕНСАЦИИ CSS*/;
        this.y = spawnPositionY /*ДЛЯ КОМПЕНСАЦИИ CSS*/;
        this.z = spawnPositionZ;
        this.speed = speed;
        this.interval = null;
        this.saveZone = true;
        this.damage = damage;

        visualisationArmourAdd(this);
    }

    initInert() {
        this.interval = setInterval(() => {
            directionalEffect(this.z, this.speed);
            visualisationArmourRerender(this)
        }, 100);
        setTimeout(() => {
            this.saveZone = false;
        }, 200);
    }

    stopInert() {
        clearInterval(this.interval);
    }

    shiftX = (units) => {
        this.x += units;
    }

    shiftY = (units) => {
        this.y += units;
    }
}

class Player {
    constructor(color, name, startPositionX, startPositionY, stats) {
        this.color = color;
        this.name = name;
        this.x = startPositionX /*ДЛЯ КОМПЕНСАЦИИ CSS*/;
        this.y = startPositionY /*ДЛЯ КОМПЕНСАЦИИ CSS*/;
        this.z = 0;
        this.hp = stats.hp;
        this.mp = stats.mp;
        this.damage = stats.damage;
        this.speed = stats.speed;
    }

    shiftX = (units) => {
        this.x += units;
    }

    shiftY = (units) => {
        this.y += units;
    }

    shiftZ = (angle) => {
        this.z += angle;
    }

    getDamage = (damage) => {
        this.hp -= damage;
        if (this.hp <= 0) {
            setTimeout(() => {
                death(this.name);
                window.location.reload();
            }, 350)
        }
    }
}

const directionalEffect = (z, number) => {
    const radian = 180 / Math.PI;
    return {
        coifX: number * Math.cos(z / radian),
        coifY: number * Math.sin(z / radian)
    }
}

function initControllers(controllsSet, player) {
    // if ( !playerVisualized[player.name] ) {
    //     throw 'ТАКОГО ИГРОКА НЕ СУЩЕСТВУЕТ !';
    // }
    let lastKey = null;
    let interval = null;
    document.addEventListener('keydown', (e) => {
        if (
            e.code !== controllsSet.top &&
            e.code !== controllsSet.left &&
            e.code !== controllsSet.bottom &&
            e.code !== controllsSet.right &&
            e.code !== controllsSet.attack
        ) {
            return;
        }
        if (lastKey === e.code) return;
        lastKey = e.code;
        clearInterval(interval);

        const {coifX, coifY} = directionalEffect(player.z, player.speed)

        if (e.code === controllsSet.top) {
            interval = setInterval(() => {
                player.shiftX(coifX);
                player.shiftY(coifY);
            }, 33)
        } else if (e.code === controllsSet.bottom) {
            interval = setInterval(() => {
                player.shiftX(-coifX);
                player.shiftY(-coifY);
            }, 33)
        } else if (e.code === controllsSet.left) {
            interval = setInterval(() => {
                player.shiftZ(player.speed);
            }, 33)
        } else if (e.code === controllsSet.right) {
            interval = setInterval(() => {
                player.shiftZ(-player.speed);
            }, 33)
        } else if (e.code === controllsSet.attack) {
            if (player.mp <= 0 || typeof player.mp !== 'number') {
                player.mp = 'ПУСТО'
                return;
            }
            const armour = new Armour('green', Math.random(), player.x, player.y, player.z, 15, player.damage);
            player.mp -= 1;
            armorList.push(armour);
            armour.initInert();
            setInterval(() => {
                const {coifX, coifY} = directionalEffect(armour.z, armour.speed);
                armour.shiftX(coifX);
                armour.shiftY(coifY);
            }, 50)

        }
    });

    document.addEventListener('keyup', (e) => {
        if (
            e.code !== controllsSet.top &&
            e.code !== controllsSet.left &&
            e.code !== controllsSet.bottom &&
            e.code !== controllsSet.right &&
            e.code !== controllsSet.attack ||
            e.code !== lastKey
        ) {
            return;
        }
        if (lastKey === e.code) lastKey = null;
        clearInterval(interval)
    });

}

function death(name) {
    alert(`${name} УНИЧТОЖЕН`)
}

function initGame() {

}

function visualisationPlayer(player) {
    if (!playerVisualized[player.name]) {
        const elem = document.createElement('div');
        elem.style.position = 'absolute';
        elem.style.width = `100px`;
        elem.style.height = `100px`;
        elem.style.bottom = `${player.y - 50}px`;
        elem.style.left = `${player.x + 50}px`;
        elem.style.backgroundColor = player.color;
        elem.style.display = 'flex';
        elem.style.justifyContent = 'center';
        elem.style.alignItems = 'center';
        elem.style.flexDirection = 'column';
        elem.style.borderRadius = '50%';
        elem.style.transitionDuration = '0.15s';
        elem.style.fontSize = '10px';
        elem.style.color = '#fff';
        elem.innerHTML = `
        <b>${player.name}</b>
        <div>HP: ${player.hp}</div>
        <div>DAMAGE: ${player.damage}</div>
        <div style="transform-origin: center; width: 100px; height: 10px; border-radius: 3px; border-right: 2px solid aqua; transform: rotate(${-player.z}deg);"></div>
        <div>MP: ${player.mp}</div>
        <div>SPEED: ${player.speed}</div>
        <div>ANGLE: ${player.z}</div>
        `;
        screen.append(elem);
        playerVisualized[player.name] = elem;
    } else {
        playerVisualized[player.name].style.bottom = `${player.y - 50}px`;
        playerVisualized[player.name].style.left = `${player.x - 50}px`;
        playerVisualized[player.name].innerHTML = `
        <b>${player.name}</b>
        <div>HP: ${player.hp}</div>
        <div>DAMAGE: ${player.damage}</div>
        <div style="transform-origin: center; width: 100px; height: 10px; border-radius: 3px; border-right: 5px solid aqua; transform: rotate(${-player.z}deg);"></div>
        <div>MP: ${player.mp}</div>
        <div>SPEED: ${player.speed}</div>
        <div>ANGLE: ${Math.floor(player.z)}</div>
        `;
    }
}

function visualisationArmourAdd(armour) {
    if (!armourVisualized[armour.id]) {
        const elem = document.createElement('div');
        elem.style.position = 'absolute';
        elem.style.width = `10px`;
        elem.style.height = `10px`;
        elem.style.bottom = `${armour.y - 5}px`;
        elem.style.left = `${armour.x + 5}px`;
        elem.style.backgroundColor = armour.color;
        elem.style.display = 'flex';
        elem.style.justifyContent = 'center';
        elem.style.alignItems = 'center';
        elem.style.flexDirection = 'column';
        elem.style.borderRadius = '50%';
        elem.style.transitionDuration = '0.15s';
        elem.style.fontSize = '10px';
        elem.style.color = '#fff';
        elem.innerHTML = `
        <div style="transform-origin: center; width: 10px; height: 10px; border-radius: 3px; border-right: 2px solid aqua; transform: rotate(${-armour.z}deg);"></div>
        `;
        screen.append(elem);
        armourVisualized[armour.id] = elem;
    }
}

function visualisationArmourRerender(armour) {
    armourVisualized[armour.id].style.bottom = `${armour.y - 5}px`;
    armourVisualized[armour.id].style.left = `${armour.x + 5}px`;
    armourVisualized[armour.id].innerHTML = `
        <div style="transform-origin: center; width: 10px; height: 10px; border-radius: 3px; border-right: 5px solid aqua; transform: rotate(${-armour.z}deg);"></div>
        `;
}

function limitMovePlayer(player, angle) {
}

function collisions() {
    for (let i = 0; playerList.length > i; i++) {
        // playerList.forEach( item => {
        //     if ( playerList[i].x - item.x >= 100 ) {
        //         const angle = Math.atan( ( ( playerList[i].y - item.y ) / ( playerList[i].x - item.x ) ) );
        //         limitMovePlayer( playerList[i].x, angle );
        //         limitMovePlayer( item.x, angle );
        //     }
        // } );

        armorList.forEach((item, index) => {
            if ((playerList[i].x - item.x) * (playerList[i].x - item.x) + (playerList[i].y - item.y) * (playerList[i].y - item.y) <= (50 + 2) * (50 + 2)) {
                if (!item.saveZone) {
                    playerList[i].getDamage(item.damage);
                    if (armourVisualized[item.id]) {
                        armourVisualized[item.id].remove();
                    }
                    armorList[index].stopInert();
                    delete armourVisualized[item.id];
                    armorList.pop(i);
                }
            }
        });
    }
}

function initOnlineController(player) {
    setInterval(() => {
        // sync
        axios.post('http://85.113.58.53:9990/move', {
            playerName,
            position: {x: window[playerName].x, y: window[playerName].y, z: window[playerName].z}
        }).then(res => {
            console.log(res.data)
            secondPlayer.x = res.data.x;
            secondPlayer.y = res.data.y;
            secondPlayer.z = res.data.z;
        });
    }, 10)
}

window[playerName] = new Player(
    'red',
    playerName,
    50,
    50,
    {
        hp: 100,
        mp: 25,
        damage: 10,
        speed: 1
    }
);

initControllers(controlls.firstPlayer, window[playerName])

const secondPlayer = new Player('blue', 'second', 500, 500, {
    hp: 60,
    mp: 25,
    damage: 15,
    speed: 2
});

// initControllers( controlls.secondPlayer, secondPlayer )

playerList.push(window[playerName])
playerList.push(secondPlayer)

initOnlineController(window[playerName]);

setInterval(() => {
    visualisationPlayer(window[playerName]);
    visualisationPlayer(secondPlayer);
    collisions();
}, 100)
