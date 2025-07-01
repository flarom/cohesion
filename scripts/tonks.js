function displayGameOver(){
    alert("you died");
    location.reload();
}

const spriteSize = 16;
const defaultWidth = 16;
const defaultHeight = defaultWidth;

const movementSpeedNormal = 60;
const movementSpeedFast = 80;
const movementSpeedSlow = 30;
const movementSpeedStationary = 0;

const bulletSpeedNormal = 100;
const bulletSpeedFast = 150;

const fireRateCooldownSlow = 1.0;
const fireRateCooldownFast = 0.5;
const fireRateCooldownControlled = 0;

const behaviourControlled = 0; // responds to keyboard and mouse input, instead of randomly moving
const behaviourPassive = 1;
const behaviourDefensive = 2;
const behaviourIncautious = 3;
const behaviourOffensive = 4;
const behaviourActive = 5;
const behaviourDynamic = 6;

const tankTypes = [
    {
        id:               4,
        name:             "player",
        movement:         movementSpeedNormal,
        bulletSpeed:      bulletSpeedNormal,
        fireRateCooldown: fireRateCooldownControlled,
        ricochets:        1,
        maxBullets:       5,
        maxMines:         2,
        behaviour:        behaviourControlled
    },
    {
        id:               5,
        name:             "brown",
        movement:         movementSpeedStationary,
        bulletSpeed:      bulletSpeedNormal,
        fireRateCooldown: fireRateCooldownSlow,
        ricochets:        1,
        maxBullets:       1,
        maxMines:         0,
        behaviour:        behaviourPassive
    },
    {
        id:               5.1,
        name:             "ash",
        movement:         movementSpeedSlow,
        bulletSpeed:      bulletSpeedNormal,
        fireRateCooldown: fireRateCooldownSlow,
        ricochets:        1,
        maxBullets:       1,
        maxMines:         0,
        behaviour:        behaviourDefensive
    },
    {
        id:               5.2,
        name:             "marine",
        movement:         movementSpeedSlow,
        bulletSpeed:      bulletSpeedFast,
        fireRateCooldown: fireRateCooldownSlow,
        ricochets:        0,
        maxBullets:       1,
        maxMines:         0,
        behaviour:        behaviourDefensive
    },
    {
        id:               5.3,
        name:             "yellow",
        movement:         movementSpeedNormal,
        bulletSpeed:      bulletSpeedNormal,
        fireRateCooldown: fireRateCooldownSlow,
        ricochets:        1,
        maxBullets:       1,
        maxMines:         4,
        behaviour:        behaviourIncautious
    },
    {
        id:               5.4,
        name:             "pink",
        movement:         movementSpeedSlow,
        bulletSpeed:      bulletSpeedNormal,
        fireRateCooldown: fireRateCooldownFast,
        ricochets:        1,
        maxBullets:       3,
        maxMines:         0,
        behaviour:        behaviourOffensive
    },
    {
        id:               5.5,
        name:             "green",
        movement:         movementSpeedStationary,
        bulletSpeed:      bulletSpeedFast,
        fireRateCooldown: fireRateCooldownFast,
        ricochets:        2,
        maxBullets:       2,
        maxMines:         0,
        behaviour:        behaviourActive
    },
    {
        id:               5.6,
        name:             "violet",
        movement:         movementSpeedNormal,
        bulletSpeed:      bulletSpeedNormal,
        fireRateCooldown: fireRateCooldownFast,
        ricochets:        1,
        maxBullets:       5,
        maxMines:         2,
        behaviour:        behaviourOffensive
    },
    {
        id:               5.7,
        name:             "white",
        movement:         movementSpeedSlow,
        bulletSpeed:      bulletSpeedNormal,
        fireRateCooldown: fireRateCooldownFast,
        ricochets:        1,
        maxBullets:       5,
        maxMines:         2,
        behaviour:        behaviourOffensive
    },
    {
        id:               5.8,
        name:             "black",
        movement:         movementSpeedFast,
        bulletSpeed:      bulletSpeedFast,
        fireRateCooldown: fireRateCooldownFast,
        ricochets:        0,
        maxBullets:       3,
        maxMines:         2,
        behaviour:        behaviourDynamic
    },
];

let map = {
    "title": "blank",
    "authors": "blank",
    "version": "1",
    "map": [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1, 3, 3, 1,
        0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0,
        0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
        0, 0, 4, 0, 0, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0,
        0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
        1, 3, 3, 1, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ],
    "width": 22,
    "height": 16,
};

//#region MAP
const tileTypes = [
    {
        id: 0,
        name: "grass",
        spritesheet: "resources/sprites/grass.png",
        frameWidth: 16,
        frameHeight: 16,
        tiles: true,
        connects: { n: true, e: true, s: true, w: true, ne: true, nw: true, se: true, sw: true },
        tankCollidable: false,
        bulletCollidable: false
    },
    {
        id: 1,
        name: "wall",
        spritesheet: "resources/sprites/wall.png",
        frameWidth: 16,
        frameHeight: 16,
        tiles: true,
        connects: { n: false, e: false, s: false, w: false, ne: false, nw: false, se: false, sw: false },
        tankCollidable: true,
        bulletCollidable: true
    },
    {
        id: 2,
        name: "breakable_wall",
        spritesheet: "resources/sprites/breakable_wall.png",
        frameWidth: 16,
        frameHeight: 16,
        tiles: false,
        connects: { n: false, e: false, s: false, w: false, ne: false, nw: false, se: false, sw: false },
        tankCollidable: true,
        bulletCollidable: true
    },
    {
        id: 2.1,
        name: "broken_breakable_wall",
        spritesheet: "resources/sprites/broken_breakable_wall.png",
        frameWidth: 16,
        frameHeight: 16,
        tiles: false,
        connects: { n: false, e: false, s: false, w: false, ne: false, nw: false, se: false, sw: false },
        tankCollidable: false,
        bulletCollidable: false
    },
    {
        id: 3,
        name: "water",
        spritesheet: "resources/sprites/water.png",
        frameWidth: 16,
        frameHeight: 16,
        tiles: true,
        connects: { n: true, e: true, s: true, w: true, ne: false, nw: false, se: false, sw: false },
        tankCollidable: true,
        bulletCollidable: false
    },
    {
        id: 4,
        name: "tank_spawn",
        spritesheet: "resources/sprites/spawn.png",
        frameWidth: 16,
        frameHeight: 16,
        tiles: false,
        connects: { n: true, e: true, s: true, w: true, ne: true, nw: true, se: true, sw: true },
        tankCollidable: false,
        bulletCollidable: false
    }
];

function preloadMapSprites(scene) {
    tileTypes.forEach(tile => {
        scene.load.spritesheet(
            tile.name,
            tile.spritesheet,
            { frameWidth: tile.frameWidth, frameHeight: tile.frameHeight }
        );
    });

    scene.load.image("tank", "resources/sprites/tank1.png");
    scene.load.image("turret", "resources/sprites/turret.png");
}

function connects(tileId, neighborId, dir, tileTypes) {
    const tile = tileTypes.find(t => t.id === tileId);
    const neighbor = tileTypes.find(t => t.id === neighborId);
    if (!tile || !neighbor) return false;
    if (!tile.connects[dir]) return false;
    return tileId === neighborId;
}

function getTileFrame(mapArr, cols, i, tileTypes) {
    const rows = Math.floor(mapArr.length / cols);
    const x = i % cols;
    const y = Math.floor(i / cols);
    const tileId = mapArr[i];

    function neighborId(nx, ny) {
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return -1;
        return mapArr[ny * cols + nx];
    }

    const n  = neighborId(x, y - 1) === tileId;
    const e  = neighborId(x + 1, y) === tileId;
    const s  = neighborId(x, y + 1) === tileId;
    const w  = neighborId(x - 1, y) === tileId;
    const ne = neighborId(x + 1, y - 1) === tileId;
    const nw = neighborId(x - 1, y - 1) === tileId;
    const se = neighborId(x + 1, y + 1) === tileId;
    const sw = neighborId(x - 1, y + 1) === tileId;

    const code = (n << 3) | (e << 2) | (s << 1) | w;

    if (n && e && !ne) return 42;
    if (n && w && !nw) return 43;
    if (s && e && !se) return 34;
    if (s && w && !sw) return 35;

    const bitmask = {
        0b0000: 27, // isolated
        0b0001: 26, // W
        0b0010: 3,  // S
        0b0011: 2,  // S + W
        0b0100: 24, // E
        0b0101: 25, // E + W
        0b0110: 0,  // E + S
        0b0111: 1,  // E + S + W
        0b1000: 19, // N
        0b1001: 18, // N + W
        0b1010: 11, // N + S
        0b1011: 10, // N + S + W
        0b1100: 16, // N + E
        0b1101: 17, // N + E + W
        0b1110: 8,  // N + E + S
        0b1111: 9   // N + E + S + W
    };

    return bitmask[code] ?? 23;
}

let currentScene = null;

function refreshMap() {
    if (currentScene) {
        const x = playerTank?.x;
        const y = playerTank?.y;
        const angle = playerTank?.angle;
        const turretAngle = playerTurret?.rotation;

        drawMap(currentScene, map, null);

        if (x !== undefined && y !== undefined) {
            playerTank = currentScene.physics.add.sprite(x, y, "tank");
            currentScene.textures.get('tank').setFilter(Phaser.Textures.NEAREST);
            playerTank.setCollideWorldBounds(true);
            playerTank.setDepth(1);
            playerTank.angle = angle || 0;
            playerTank.body.setSize(14, 14, true);

            playerTurret = currentScene.add.sprite(x, y, "turret");
            playerTurret.setDisplaySize(15, 15);
            playerTurret.setOrigin(0.5, 0.5);
            playerTurret.setDepth(2);
            currentScene.textures.get('turret').setFilter(Phaser.Textures.NEAREST);
            playerTurret.rotation = turretAngle || 0;

            setupTankCollisions(currentScene, map);
        }
    }
}

function drawMap(scene, mapData, tankIndex = null) {
    const cols = mapData.width || defaultWidth;
    const rows = mapData.height || defaultHeight;
    scene.children.removeAll();
    for (let i = 0; i < mapData.map.length; i++) {
        const tileId = mapData.map[i];
        const tileType = tileTypes.find(t => t.id === tileId);
        if (!tileType) continue;
        const x = (i % cols) * spriteSize;
        const y = Math.floor(i / cols) * spriteSize;
        const frame = tileType.tiles
            ? getTileFrame(mapData.map, cols, i, tileTypes)
            : 0;
        scene.add.sprite(x + spriteSize / 2, y + spriteSize / 2, tileType.name, frame);
    }
    if (tankIndex !== null) {
        const x = (tankIndex % cols) * spriteSize + spriteSize / 2;
        const y = Math.floor(tankIndex / cols) * spriteSize + spriteSize / 2;
        playerTank = scene.physics.add.sprite(x, y, "tank");
        scene.textures.get('tank').setFilter(Phaser.Textures.NEAREST);
        playerTank.setCollideWorldBounds(true);
        playerTank.setDepth(1);
        playerTank.angle = 0;
        playerTank.body.setSize(14, 14, true);

        playerTurret = scene.add.sprite(x, y, "turret");
        playerTurret.setDisplaySize(15, 15);
        playerTurret.setOrigin(0.5, 0.5);
        playerTurret.setDepth(2);
        scene.textures.get('turret').setFilter(Phaser.Textures.NEAREST);

        playerTankType = getTankTypeById(4);
    }
}

//#endregion

//#region PLAYER
function findTankSpawn(mapData) {
    let spawnIndexes = [];
    for (let i = 0; i < mapData.map.length; i++) {
        if (mapData.map[i] === 4) spawnIndexes.push(i);
    }
    if (spawnIndexes.length > 0) {
        const idx = spawnIndexes[Math.floor(Math.random() * spawnIndexes.length)];
        return idx;
    }
    const firstZero = mapData.map.indexOf(0);
    if (firstZero !== -1) {
        return firstZero;
    }
    return 0;
}

let playerTank = null;
let playerTurret = null;
let tankSpawnIndex = null;
let playerTankType = null;
let playerBullets = [];
let lastFireTime = 0;

function getTankTypeById(id) {
    return tankTypes.find(t => t.id === id);
}

function canFire() {
    if (!playerTankType) return false;
    if (playerBullets.length >= playerTankType.maxBullets) return false;
    if (playerTankType.fireRateCooldown === 0) return true;
    const now = performance.now() / 1000;
    return (now - lastFireTime) >= playerTankType.fireRateCooldown;
}

function setupTankCollisions(scene, mapData) {
    const cols = mapData.width || defaultWidth;
    const tankCollisionGroup = scene.physics.add.staticGroup();
    const bulletCollisionGroup = scene.physics.add.staticGroup();
    for (let i = 0; i < mapData.map.length; i++) {
        const tileId = mapData.map[i];
        const tileType = tileTypes.find(t => t.id === tileId);
        const x = (i % cols) * spriteSize + spriteSize / 2;
        const y = Math.floor(i / cols) * spriteSize + spriteSize / 2;
        if (tileType && tileType.tankCollidable) {
            const block = scene.add.rectangle(x, y, spriteSize, spriteSize);
            scene.physics.add.existing(block, true);
            tankCollisionGroup.add(block);
        }
        if (tileType && tileType.bulletCollidable) {
            const block = scene.add.rectangle(x, y, spriteSize, spriteSize);
            scene.physics.add.existing(block, true);
            bulletCollisionGroup.add(block);
        }
    }
    scene.physics.add.collider(playerTank, tankCollisionGroup);
    scene.collisionGroup = tankCollisionGroup;
    scene.bulletCollisionGroup = bulletCollisionGroup;
}

let keysPressed = {};

function setupTankControls(scene) {
    scene.input.keyboard.on('keydown', function (event) {
        keysPressed[event.key] = true;
        if (!playerTank || !playerTankType) return;
        const speed = playerTankType.movement;
        if (event.key === 'w' || event.key === 'ArrowUp') {
            scene.physics.velocityFromRotation(playerTank.rotation, speed, playerTank.body.velocity);
        } else if (event.key === 's' || event.key === 'ArrowDown') {
            scene.physics.velocityFromRotation(playerTank.rotation, -speed, playerTank.body.velocity);
        }
    });
    scene.input.keyboard.on('keyup', function (event) {
        keysPressed[event.key] = false;
        if (!playerTank) return;
        if (
            event.key === 'w' || event.key === 'ArrowUp' ||
            event.key === 's' || event.key === 'ArrowDown'
        ) {
            playerTank.body.setVelocity(0, 0);
        }
    });
}

function fireBullet(scene) {
    if (!canFire()) return;
    lastFireTime = performance.now() / 1000;

    const angle = playerTurret.rotation;
    const speed = playerTankType.bulletSpeed;
    const ricochets = playerTankType.ricochets;

    const offset = 18;
    const startX = playerTank.x + Math.cos(angle) * offset;
    const startY = playerTank.y + Math.sin(angle) * offset;

    const bullet = scene.add.rectangle(startX, startY, 2, 2, 0xffffff).setDepth(3);
    scene.physics.add.existing(bullet);
    bullet.body.setAllowGravity(false);
    bullet.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    bullet.body.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;
    bullet.ricochetsLeft = ricochets;
    bullet.trail = [];
    bullet.trailLength = Math.max(8, speed / 2);

    bullet.destroyTimer = scene.time.delayedCall(5000, () => {
        destroyBullet(bullet);
    });

    playerBullets.push(bullet);

    scene.physics.add.collider(bullet, scene.bulletCollisionGroup, function(b, block) {
        const bx = Math.floor(block.x / spriteSize);
        const by = Math.floor(block.y / spriteSize);
        const cols = map.width || defaultWidth;
        const tileIdx = by * cols + bx;
        const tileId = map.map[tileIdx];
        const tileType = tileTypes.find(t => t.id === tileId);

        if (tileType && tileType.id === 2) {
            map.map[tileIdx] = 2.1;
            refreshMap();
            destroyBullet(bullet);

            const px = block.x;
            const py = block.y;
            const particles = scene.add.particles(0x000000, {
                x: px,
                y: py,
                speed: { min: 30, max: 80 },
                angle: { min: 0, max: 360 },
                lifespan: 350,
                quantity: 12,
                scale: { start: 0.5, end: 0 },
                alpha: { start: 1, end: 0 },
                gravityY: 0
            });
            scene.time.delayedCall(400, () => {
                particles.destroy();
            });
        } else if (tileType && tileType.bulletCollidable) {
            if (bullet.ricochetsLeft > 0) {
                bullet.ricochetsLeft--;

                const vx = bullet.body.velocity.x;
                const vy = bullet.body.velocity.y;

                const dx = bullet.x - block.x;
                const dy = bullet.y - block.y;

                const length = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = dx / length;
                const ny = dy / length;

                const dot = vx * nx + vy * ny;
                const rvx = vx - 2 * dot * nx;
                const rvy = vy - 2 * dot * ny;

                bullet.body.setVelocity(rvx, rvy);
            } else {
                destroyBullet(bullet);
            }
        }
    });

    scene.physics.world.on('worldbounds', function(body) {
        if (body.gameObject !== bullet) return;
        if (bullet.ricochetsLeft > 0) {
            bullet.ricochetsLeft--;

            const vx = bullet.body.velocity.x;
            const vy = bullet.body.velocity.y;

            let nx = 0, ny = 0;
            if (bullet.body.blocked.left) nx = 1;
            else if (bullet.body.blocked.right) nx = -1;
            if (bullet.body.blocked.up) ny = 1;
            else if (bullet.body.blocked.down) ny = -1;

            const dot = vx * nx + vy * ny;
            const rvx = vx - 2 * dot * nx;
            const rvy = vy - 2 * dot * ny;

            bullet.body.setVelocity(rvx, rvy);
        } else {
            destroyBullet(bullet);
        }
    });

    scene.physics.add.overlap(bullet, playerTank, function(b, tank) {
        destroyBullet(bullet);
        tank.destroy();
        if (playerTurret) playerTurret.destroy();
        displayGameOver();
    });
}

function destroyBullet(bullet) {
    if (bullet.destroyTimer) {
        bullet.destroyTimer.remove(false);
    }
    bullet.destroy();
    playerBullets = playerBullets.filter(b => b !== bullet);
    console.log('quebrou, mas é o destino da bala~');
}

function updateBullets(scene) {
    for (const bullet of playerBullets) {
        bullet.prev = { x: bullet.x, y: bullet.y };
        bullet.trail.push({x: bullet.x, y: bullet.y});
        if (bullet.trail.length > bullet.trailLength) bullet.trail.shift();

        if (
            bullet.x < 0 || bullet.x > scene.sys.game.config.width ||
            bullet.y < 0 || bullet.y > scene.sys.game.config.height
        ) {
            destroyBullet(bullet);
        }
    }
}

function renderBulletTrails(scene) {
    if (!scene.bulletTrailGraphics) {
        scene.bulletTrailGraphics = scene.add.graphics().setDepth(1);
    }
    const graphics = scene.bulletTrailGraphics;
    graphics.clear();
    for (const bullet of playerBullets) {
        for (let i = 1; i < bullet.trail.length; i++) {
            const a = bullet.trail[i-1];
            const b = bullet.trail[i];
            const alpha = i / bullet.trail.length;
            graphics.lineStyle(2, 0xffffff, 0.2 * alpha);
            graphics.beginPath();
            graphics.moveTo(a.x, a.y);
            graphics.lineTo(b.x, b.y);
            graphics.strokePath();
        }
    }
}

//#endregion

const ROTATE_SPEED = 3;

const config = {
    type: Phaser.AUTO,
    width: (map.width || defaultWidth) * spriteSize,
    height: ((map.height || defaultHeight) * spriteSize) + spriteSize,
    parent: window.PHASER_PARENT || null,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: function () {
            preloadMapSprites(this);
        },
        create: function () {
            currentScene = this;
            this.physics.world.setBoundsCollision(true, true, true, true);

            tankSpawnIndex = findTankSpawn(map);
            drawMap(this, map, tankSpawnIndex);
            setupTankCollisions(this, map);
            setupTankControls(this);

            this.input.on('pointerdown', () => {
                if (playerTankType && playerTankType.fireRateCooldown === 0) {
                    fireBullet(this);
                }
            });

            this.physics.world.on('worldbounds', function(body) {
                const bullet = body.gameObject;
                if (!bullet || bullet.ricochetsLeft === undefined) return;

                if (bullet.ricochetsLeft > 0) {
                    bullet.ricochetsLeft--;

                    const v = { x: bullet.body.velocity.x, y: bullet.body.velocity.y };
                    const n = { x: 0, y: 0 };

                    if (bullet.body.blocked.left) n.x = 1;
                    if (bullet.body.blocked.right) n.x = -1;
                    if (bullet.body.blocked.up) n.y = 1;
                    if (bullet.body.blocked.down) n.y = -1;

                    const dot = v.x * n.x + v.y * n.y;
                    bullet.body.setVelocity(
                        v.x - 2 * dot * n.x,
                        v.y - 2 * dot * n.y
                    );
                } else {
                    destroyBullet(bullet);
                }
            });

            this.physics.add.collider(this.bulletCollisionGroup, this.bulletCollisionGroup, (bullet, block) => {
                if (!bullet.ricochetsLeft || bullet.ricochetsLeft <= 0) {
                    destroyBullet(bullet);
                    return;
                }

                bullet.ricochetsLeft--;

                const v = { x: bullet.body.velocity.x, y: bullet.body.velocity.y };
                const n = { x: 0, y: 0 };

                if (bullet.body.blocked.left) n.x = 1;
                if (bullet.body.blocked.right) n.x = -1;
                if (bullet.body.blocked.up) n.y = 1;
                if (bullet.body.blocked.down) n.y = -1;

                const dot = v.x * n.x + v.y * n.y;
                bullet.body.setVelocity(
                    v.x - 2 * dot * n.x,
                    v.y - 2 * dot * n.y
                );
            });
        },
        update: function () {
            if (!playerTank || !playerTankType) return;

            if (keysPressed['a'] || keysPressed['ArrowLeft']) {
                playerTank.angle -= ROTATE_SPEED;
            }
            if (keysPressed['d'] || keysPressed['ArrowRight']) {
                playerTank.angle += ROTATE_SPEED;
            }

            const speed = playerTankType.movement;
            if (keysPressed['w'] || keysPressed['ArrowUp']) {
                this.physics.velocityFromRotation(playerTank.rotation, speed, playerTank.body.velocity);
            } else if (keysPressed['s'] || keysPressed['ArrowDown']) {
                this.physics.velocityFromRotation(playerTank.rotation, -speed, playerTank.body.velocity);
            } else {
                playerTank.body.setVelocity(0, 0);
            }

            if (playerTurret) {
                playerTurret.x = playerTank.x;
                playerTurret.y = playerTank.y;

                const pointer = this.input.activePointer;
                const dx = pointer.worldX - playerTank.x;
                const dy = pointer.worldY - playerTank.y;
                playerTurret.rotation = Math.atan2(dy, dx);
            }

            if (playerTankType && playerTankType.fireRateCooldown > 0 && this.input.activePointer.isDown) {
                fireBullet(this);
            }

            updateBullets(this);
            renderBulletTrails(this);
        }
    }
};

window.onload = function () {
    new Phaser.Game(config);
};