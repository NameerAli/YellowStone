// Create a canvas element
const canvas = document.createElement('canvas');
canvas.width = 1250;
canvas.height = 580;
document.body.appendChild(canvas);

// Define the canvas context
const ctx = canvas.getContext('2d');

// Boid class representing a deer or a wolf
class Boid {
    constructor(x, y, vx, vy, species) {
        this.position = {
            x: x,
            y: y
        };
        this.velocity = {
            x: vx,
            y: vy
        };
        this.species = species;
        this.killedByWolf = false;
        // Load wolf image
        if (this.species === 'wolf') {
            this.image = new Image();
            this.image.src = 'wolf.png'; // Path to your wolf image
        }
        if (this.species === 'deer') {
            this.image = new Image();
            this.image.src = 'deer.png'; // Path to your wolf image
        }

    }


    update(boids) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.handleBoundaries();
        this.handleBoids(boids);
    }

    handleBoundaries() {
        const padding = 50;
        const maxX = canvas.width - padding;
        const maxY = canvas.height - padding;

        if (this.position.x < padding) {
            this.position.x = padding;
            this.velocity.x *= -1;
        } else if (this.position.x > maxX) {
            this.position.x = maxX;
            this.velocity.x *= -1;
        }

        if (this.position.y < padding) {
            this.position.y = padding;
            this.velocity.y *= -1;
        } else if (this.position.y > maxY) {
            this.position.y = maxY;
            this.velocity.y *= -1;
        }
    }

    handleBoids(boids) {
        if (this.species === 'deer') {
            this.updateDeer(boids);
        } else if (this.species === 'wolf') {
            this.updateWolf(boids);
        }
    }

    updateDeer(boids) {
        if (this.killedByWolf) {
            const avgWolfX = boids
                .filter(boid => boid.species === 'wolf')
                .reduce((total, wolf) => total + wolf.position.x, 0) / boids.filter(boid => boid.species === 'wolf').length;

            const avgWolfY = boids
                .filter(boid => boid.species === 'wolf')
                .reduce((total, wolf) => total + wolf.position.y, 0) / boids.filter(boid => boid.species === 'wolf').length;

            this.velocity.x = this.position.x - avgWolfX;
            this.velocity.y = this.position.y - avgWolfY;
        } else {
            const separationRadius = 30;
            const alignmentRadius = 40;
            const cohesionRadius = 40;

            let totalDeer = 0;
            let avgDeerX = 0;
            let avgDeerY = 0;

            for (const otherDeer of boids.filter(boid => boid.species === 'deer')) {
                const distance = Math.sqrt(
                    Math.pow(this.position.x - otherDeer.position.x, 2) +
                    Math.pow(this.position.y - otherDeer.position.y, 2)
                );

                if (distance < separationRadius && distance > 0) {
                    const diffX = this.position.x - otherDeer.position.x;
                    const diffY = this.position.y - otherDeer.position.y;
                    const diffLength = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
                    this.velocity.x += diffX / diffLength;
                    this.velocity.y += diffY / diffLength;
                }

                if (distance < alignmentRadius && distance > 0) {
                    this.velocity.x += otherDeer.velocity.x;
                    this.velocity.y += otherDeer.velocity.y;
                }

                if (distance < cohesionRadius && distance > 0) {
                    avgDeerX += otherDeer.position.x;
                    avgDeerY += otherDeer.position.y;
                    totalDeer++;
                }
            }

            if (totalDeer > 0) {
                avgDeerX /= totalDeer;
                avgDeerY /= totalDeer;

                const cohesionForceX = (avgDeerX - this.position.x) / cohesionRadius;
                const cohesionForceY = (avgDeerY - this.position.y) / cohesionRadius;

                this.velocity.x += cohesionForceX;
                this.velocity.y += cohesionForceY;
            }

            const speedLimit = 1;
            const velocityLength = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));

            if (velocityLength > speedLimit) {
                this.velocity.x = (this.velocity.x / velocityLength) * speedLimit;
                this.velocity.y = (this.velocity.y / velocityLength) * speedLimit;
            }
        }
    }

    updateWolf(boids) {
        const separationRadius = 40;
        const alignmentRadius = 50;
        const cohesionRadius = 50;

        let totalWolves = 0;
        let avgWolfX = 0;
        let avgWolfY = 0;

        for (const otherWolf of boids.filter(boid => boid.species === 'wolf')) {
            const distance = Math.sqrt(
                Math.pow(this.position.x - otherWolf.position.x, 2) +
                Math.pow(this.position.y - otherWolf.position.y, 2)
            );

            if (distance < separationRadius && distance > 0) {
                const diffX = this.position.x - otherWolf.position.x;
                const diffY = this.position.y - otherWolf.position.y;
                const diffLength = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
                this.velocity.x += diffX / diffLength;
                this.velocity.y += diffY / diffLength;
            }

            if (distance < alignmentRadius && distance > 0) {
                this.velocity.x += otherWolf.velocity.x;
                this.velocity.y += otherWolf.velocity.y;
            }

            if (distance < cohesionRadius && distance > 0) {
                avgWolfX += otherWolf.position.x;
                avgWolfY += otherWolf.position.y;
                totalWolves++;
            }
        }

        if (totalWolves > 0) {
            avgWolfX /= totalWolves;
            avgWolfY /= totalWolves;

            const cohesionForceX = (avgWolfX - this.position.x) / cohesionRadius;
            const cohesionForceY = (avgWolfY - this.position.y) / cohesionRadius;

            this.velocity.x += cohesionForceX;
            this.velocity.y += cohesionForceY;
        }

        const speedLimit = 1;
        const velocityLength = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));

        if (velocityLength > speedLimit) {
            this.velocity.x = (this.velocity.x / velocityLength) * speedLimit;
            this.velocity.y = (this.velocity.y / velocityLength) * speedLimit;
        }
    }

    render() {
        ctx.beginPath();
        if (this.species === 'deer') {
            ctx.drawImage(this.image, this.position.x - 16, this.position.y - 16, 32, 32);
        } else if (this.species === 'wolf') {
            ctx.drawImage(this.image, this.position.x - 16, this.position.y - 16, 32, 32);
        }
        ctx.closePath();
    }
}

// Create an array to store all the boids (deer and wolves)
const boids = [];

// Create a group of deer
for (let i = 0; i < 20; i++) {
    const x = Math.random() * 100 + canvas.width - 150;
    const y = Math.random() * 100 + 50;
    const vx = Math.random() * -2 + 1;
    const vy = Math.random() * 2 - 1;
    const deer = new Boid(x, y, vx, vy, 'deer');
    boids.push(deer);
}

// Create a group of wolves
for (let i = 0; i < 10; i++) {
    const x = Math.random() * 100 + 50;
    const y = Math.random() * 100 + canvas.height - 150;
    const vx = Math.random() * 2 - 1;
    const vy = Math.random() * -2 + 1;
    const wolf = new Boid(x, y, vx, vy, 'wolf');
    boids.push(wolf);
}

// Initialize an array to store vegetation objects
const vegetationList = [
    {
        image: new Image(),
        position: { x: 200, y: 200 },
        size: { width: 50, height: 50 },
        growthRate: 0.5,
        reductionRate: 0.2,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01, // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 400, y: 0 }, // Top border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 600, y: 0 }, // Top border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 400, y: 600 }, // Bottom border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 600, y: 600 }, // Bottom border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 0, y: 200 }, // Left border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 0, y: 400 }, // Left border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 1000, y: 200 }, // Right border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 1000, y: 400 }, // Right border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 600, y: 400 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01, // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 700, y: 400 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01, // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 800, y: 400 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01, // Rate at which transparency changes
    }
    ,
    {
        image: new Image(),
        position: { x: 300, y: 400 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01, // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 200, y: 400 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01, // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 150, y: 400 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01, // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 80, y: 400 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 800, y: 10 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01, // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 800, y: 60 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 800, y: 30 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01, // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 800, y: 150 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 800, y: 660 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01, // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 430, y: 780 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    }
    ,
    {
        image: new Image(),
        position: { x: 500, y: 400 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01, // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 900, y: 400 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 950, y: 500 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01, // Rate at which transparency changes
    }
    ,
    {
        image: new Image(),
        position: { x: 345, y: 544 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    }
    ,
    {
        image: new Image(),
        position: { x: 120, y: 30 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 10, y: 667 },
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 500, y: 25 }, // Top border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 500, y: 575 }, // Bottom border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 50, y: 300 }, // Left border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 950, y: 300 }, // Right border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 200, y: 25 }, // Top border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 800, y: 25 }, // Top border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 200, y: 575 }, // Bottom border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 800, y: 575 }, // Bottom border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 50, y: 200 }, // Left border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 50, y: 400 }, // Left border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 950, y: 200 }, // Right border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 950, y: 400 }, // Right border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 625, y: 0 }, // Top border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 625, y: 580 }, // Bottom border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 0, y: 290 }, // Left border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 1250, y: 290 }, // Right border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 625, y: 0 }, // Top border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 625, y: 580 }, // Bottom border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 0, y: 290 }, // Left border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 1250, y: 290 }, // Right border
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 0, y: 0 }, // Top-left corner
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 1250, y: 0 }, // Top-right corner
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 0, y: 580 }, // Bottom-left corner
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    },
    {
        image: new Image(),
        position: { x: 1250, y: 580 }, // Bottom-right corner
        size: { width: 50, height: 50 },
        growthRate: 0.3,
        reductionRate: 0.1,
        currentSize: 1,
        transparency: 1, // Initial transparency value (fully opaque)
        transparencyGrowthRate: 0.001,
        transparencyReductionRate: 0.01,
        birthRate: 0.5 // Rate at which transparency changes
    }
    
    
    
    
];

// Load vegetation images and set paths
for (const vegetation of vegetationList) {
    vegetation.image.src = 'vegetation.png'; // Path to your vegetation image
}

// Initialize the river object
const river = {
    position: { x: canvas.width / 2, y: canvas.height / 2 },
    size: { width: 1280, height: 50 },
    color: 'blue'
};

// Update function
function update() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);



    // Render the river
    ctx.fillStyle = river.color;
    ctx.fillRect(
        river.position.x - river.size.width / 2,
        river.position.y - river.size.height / 2,
        river.size.width,
        river.size.height
    );

    // Update and render each boid
    for (const boid of boids) {
        boid.update(boids);
        boid.render();
    }

    // Render each vegetation object
    for (const vegetation of vegetationList) {
        const isDeerOnVegetation = boids.some(boid => boid.species === 'deer' && isInsideVegetation(boid.position, vegetation));

        // Increase transparency if deer are on the vegetation
        if (isDeerOnVegetation) {
            vegetation.transparency -= vegetation.transparencyReductionRate;
            vegetation.transparency = Math.max(0, vegetation.transparency);

            // Check if a new deer should be added
            if (Math.random() < vegetation.birthRate) {
                const position = {
                    x: vegetation.position.x + Math.random() * vegetation.size.width - vegetation.size.width / 2,
                    y: vegetation.position.y + Math.random() * vegetation.size.height - vegetation.size.height / 2
                };
                const velocity = {
                    x: Math.random() * 2 - 1,
                    y: Math.random() * 2 - 1
                };
                const newDeer = new Boid(position, velocity, 'deer');
                boids.push(newDeer);
            }
        }
        // Decrease transparency if no deer on the vegetation
        else {
            vegetation.transparency += vegetation.transparencyGrowthRate;
            vegetation.transparency = Math.min(1, vegetation.transparency);
        }

        // Render the vegetation with adjusted transparency
        ctx.globalAlpha = vegetation.transparency;
        ctx.drawImage(
            vegetation.image,
            vegetation.position.x - vegetation.size.width / 2,
            vegetation.position.y - vegetation.size.height / 2,
            vegetation.size.width * vegetation.currentSize,
            vegetation.size.height * vegetation.currentSize
        );
        ctx.globalAlpha = 1; // Reset global alpha

        
    }


    // // Render each vegetation object
    // for (const vegetation of vegetationList) {
    //     ctx.drawImage(
    //         vegetation.image,
    //         vegetation.position.x - vegetation.size.width / 2,
    //         vegetation.position.y - vegetation.size.height / 2,
    //         vegetation.size.width * vegetation.currentSize,
    //         vegetation.size.height * vegetation.currentSize
    //     );

    //     // Reduce vegetation size if deer are on it
    //     for (const deer of boids.filter(boid => boid.species === 'deer')) {
    //         if (isInsideVegetation(deer.position, vegetation)) {
    //             vegetation.currentSize -= vegetation.reductionRate;
    //         }
    //     }

    //     // Increase vegetation size if deer leave it
    //     if (!boids.some(boid => boid.species === 'deer' && isInsideVegetation(boid.position, vegetation))) {
    //         vegetation.currentSize += vegetation.growthRate;
    //     }

    //     // Clamp vegetation size within bounds
    //     vegetation.currentSize = Math.max(0, Math.min(1, vegetation.currentSize));
    // }



    // Detect wolf-deer collisions
    for (const wolf of boids.filter(boid => boid.species === 'wolf')) {
        for (const deer of boids.filter(boid => boid.species === 'deer')) {
            const distance = Math.sqrt(
                Math.pow(wolf.position.x - deer.position.x, 2) +
                Math.pow(wolf.position.y - deer.position.y, 2)
            );

            if (distance < 10 && !deer.killedByWolf) {
                deer.killedByWolf = true;

                // Remove the killed deer
                const index = boids.indexOf(deer);
                if (index > -1) {
                    boids.splice(index, 1);
                }

                // Move all other deer away from the wolves
                for (const otherDeer of boids.filter(boid => boid.species === 'deer' && !boid.killedByWolf)) {
                    const directionX = wolf.position.x - otherDeer.position.x;
                    const directionY = wolf.position.y - otherDeer.position.y;
                    const directionLength = Math.sqrt(
                        Math.pow(directionX, 2) + Math.pow(directionY, 2)
                    );

                    otherDeer.velocity.x = -directionX / directionLength;
                    otherDeer.velocity.y = -directionY / directionLength;
                }
            }
        }
    }


    requestAnimationFrame(update);
}


// Function to check if a point is inside the vegetation area
function isInsideVegetation(point, vegetation) {
    return (
        point.x >= vegetation.position.x - vegetation.size.width / 2 &&
        point.x <= vegetation.position.x + vegetation.size.width / 2 &&
        point.y >= vegetation.position.y - vegetation.size.height / 2 &&
        point.y <= vegetation.position.y + vegetation.size.height / 2
    );
}


// Start the animation loop
update();
